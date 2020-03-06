const schema = require('./joi-schema.js');
const bcrypt = require("bcrypt");



module.exports = (io, connection)=>{                  //socket.io routes
    io.on("connection", socket => {
        console.log("New client connected");
      
        socket.on('startRoom',(data)=>{
          const {error, value} = schema.validate({room:data.room})
          if(error) throw error;
      
          const room=value.room;
      
          connection.query(`SELECT * FROM rooms WHERE name=?`, [room], function (err, results) {
            if(err) throw err;
            if(results.length>0){

              const allowChat=()=>{
                socket.join(room,()=>{
                  connection.query(`SELECT * FROM chat_history WHERE room_name=? ORDER BY created_at ASC`, [room], function (err, results) {
                    if(err) throw err;
                    socket.emit('history',{
                      history:results
                    })
                  })
              
                  socket.on("chat",(data)=>{
                    const {error, value} = schema.validate({message:data.message, username:data.username})
                    if(error){
                      return;
                    }
                    let newData=value;
              
                    newData.room_name=room;
                    if(newData.username==="") newData.username="Anon"
                    
                    connection.query(`INSERT INTO chat_history SET ?`, newData, function (err) {
                      if(err) throw err;
                      connection.query('UPDATE rooms SET rooms.last_update=NOW() WHERE  rooms.name=?', [room], (err)=>{
                        if (err) throw err;
                      })
                      io.to(room).emit('chat',newData);
                    })
                  })
              
                })
              
                socket.on('leaveRoom',()=>{
                  socket.disconnect()
                })
              }

              if(results[0].password===null){
                allowChat();
              } else {
                bcrypt.compare(data.password, results[0].password, function(err, result) {
                  if(err) throw err;
                  if(result){
                    allowChat();
                  } else {
                    socket.emit("failedAccess")
                  }
                })
              }

            } else {
              socket.emit("failedAccess")
            }
          })
        });
        socket.on("disconnect", () => console.log("Client disconnected"));
      })
}