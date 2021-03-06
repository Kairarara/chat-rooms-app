const schema = require('./joi-schema.js');
const bcrypt = require("bcrypt");
const TokenBucket = require('./token-bucket.js');
const connection = require("./mysql-connection");

module.exports = (io, buckets)=>{                  //socket.io routes
  io.on("connection", socket => {
    console.log("New client connected");
    socket.on("disconnect",()=>{
      console.log("Client disconnected");
    })

    socket.on('startRoom',(data)=>{

      if(!buckets.hasOwnProperty(socket.handshake.address)){
        buckets[socket.handshake.address] = new TokenBucket();
      }

      if(!buckets[socket.handshake.address].removeLoginToken()){
        socket.emit("failedAccess",{message:"too many login attempts"});
        return;
      };

      const {error, value} = schema.validate({room:data.room, password:data.password})
      if(error){
        console.error(error.details[0])
        socket.emit("failedConnection",{message:"invalid user data"});
        return;
      }
  
      const room=value.room;
      const password=value.password;
  
      connection.query(`SELECT * FROM rooms WHERE name=?`, [room], function (error, results) {
        if(error){
          console.error(error);
          socket.emit("failedConnection",{message:"unexpected database failure"});
          return;
        }
        if(results.length>0){

          const allowChat=()=>{
            socket.join(room,()=>{
              connection.query(`SELECT * FROM chat_history WHERE room_name=? ORDER BY created_at ASC`, [room], function (error, results) {
                if(error){
                  console.error(error);
                  socket.emit("failedConnection",{message:"failed history retrieval"});
                  return;
                }
                socket.emit('history',{
                  history:results
                })
              })
          
              socket.on("chat",(data, scrollToChatEnd)=>{
                if(!buckets[socket.handshake.address].removeMsgToken()){
                  socket.emit("emptyBucket")
                  return;
                };
                const {error, value} = schema.validate({message:data.message, username:data.username})
                if(error){ 
                  return;
                }
                let newData=value;
          
                newData.room_name=room;
                if(newData.username==="") newData.username="Anon"
                
                connection.query(`INSERT INTO chat_history SET ?`, newData, (error)=>{
                  if(error){
                    console.error(error);
                    socket.emit("failedConnection",{message:"failed chat insert"})
                    return;
                  }
                  connection.query('UPDATE rooms SET rooms.last_update=NOW() WHERE  rooms.name=?', [room], (error)=>{
                    if(error){
                      console.error(error);
                      socket.emit("failedConnection",{message:"unexpected database error"})
                    }
                  })
                  io.to(room).emit('chat',newData);
                  scrollToChatEnd();
                })
              })
          
            })
          }

          if(results[0].password===null){
            allowChat();
          } else {
            bcrypt.compare(password, results[0].password, function(error, result) {
              if(error){
                console.error(error);
                socket.emit("failedAccess",{message:"unexpected password error"});
                return;
              }
              if(result){
                allowChat();
              } else {
                socket.emit("failedAccess",{message:"incorrect password"});
                return;
              }
            })
          }

        } else {
          socket.emit("failedConnection",{message:"room does not exist"});
          return;
        }
      })
    });
  })

  io.on("connect_error",(err)=>{
    console.error(err);
  })
}