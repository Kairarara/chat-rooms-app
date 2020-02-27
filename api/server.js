const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

/*
  TO DO: use mysql to store chats
         implement passwords with hashing
*/


//express set up
const app = express();

const port = process.env.PORT || 9000;
const server=app.listen(port, () => {
  console.log("Listening to port " + port);
});

const io = socketIo(server);
io.set('origins', '*:*');
let tdb={                               //todo database
  "Test1":{chat:["old1","old2"],password:""},
  "Test2":{chat:["old1","old2"],password:""},
  "room420":{chat:["lol","much funny"],password:""}
}

io.on("connection", socket => {
  console.log("New client connected");

  socket.on('listRooms',()=>{
    socket.emit('listRooms',{rooms:Object.keys(tdb)})
  })

  socket.on('startRoom',(data)=>{
    const room=data.room;


    socket.join(room,()=>{

      socket.emit('history',{
        history:tdb[room].chat
      })
  
      socket.on("chat",(data)=>{
        tdb[room].chat.push(data.message);
        io.to(room).emit('chat',data);
      })

    })

    socket.on('leaveRoom',()=>{
      socket.leave(room)
    })

  })


  socket.on("disconnect", () => console.log("Client disconnected"));
});


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/CreateRoom", (req, res) => {
  let data={
    nameInUse:Object.keys(tdb).includes(req.body.roomName)
  }

  if (!data.nameInUse){
    let hashedPw=req.body.password;
    tdb[req.body.roomName]={chat:[], password:hashedPw};
  }

  res.json(data)
});
