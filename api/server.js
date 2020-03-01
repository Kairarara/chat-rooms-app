const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");


/*
  TO DO:  use mysql to store chats  instead of tdb (test data base)
          add some server security
*/


const saltRounds = 10;


//express set up
const app = express();

const port = process.env.PORT || 9000;
const server=app.listen(port, () => {
  console.log("Listening to port " + port);
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//socket.io set up
const io = socketIo(server);
io.set('origins', '*:*');


let tdb={                               //todo database
  "Test1":{chat:[{username:"Anon",message:"old1"},{username:"A  non2",message:"old2"}],password:"$2b$10$L.86LiNCKoF0z.3.m5UWuuZsvOW7QNrju88dOZy22.AUMvVq/7D.m"},
  "Test2":{chat:[{username:"Anon",message:"old1"},{username:"Anon2",message:"old2"}],password:false},
  "room420":{chat:[{username:"Anon",message:"old1"},{username:"Anon2",message:"old2"}],password:false}
}




//express routes
app.get("/RoomList", (req, res) => {
  let data={
    rooms:Object.keys(tdb)
  }
  res.json(data)
});

app.post("/CreateRoom", (req, res) => {
  let nameIsValid=(name)=>{
    if(name.length>20){
      return "tooLong"
    } else if(name.length<4){
      return "tooShort"
    } else if(Object.keys(tdb).includes(name)){
      return "inUse"
    } else {
      return true;
    }
  }

  let data=nameIsValid(req.body.roomName)

  
  if (data===true){
    if(req.body.password!==false && req.body.password!==""){
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        tdb[req.body.roomName]={chat:[], password:hash};
      });
    } else {
      tdb[req.body.roomName]={chat:[], password:false};
    }
  }

  res.json(data)
});


//socket.io routes
io.on("connection", socket => {
  console.log("New client connected");



  socket.on('startRoom',(data)=>{
    const room=data.room;

    if(tdb.hasOwnProperty(data.room)){
      bcrypt.compare(data.password, tdb[data.room].password, function(err, result) {
        if(result || tdb[data.room].password===false){
          socket.join(room,()=>{
            socket.emit('history',{
              history:tdb[room].chat
            })
        
            socket.on("chat",(data)=>{
              if(data.message.message!==""){
                let newData=data.message
                if(newData.username==="") newData.username="Anon"
                tdb[room].chat.push(newData);
                io.to(room).emit('chat',newData);
              }
            })

          })

          socket.on('leaveRoom',()=>{
            console.log()
            socket.leave(room)
            socket.disconnect()
          })
        } else {
          socket.emit("failedAccess")
        }
      })
    } else {
      socket.emit("failedAccess")
    }


    socket.on("disconnect", () => console.log("Client disconnected"));
  });
})