const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");


/*
  TO DO:  use mysql to store chats
          implement usernames
          fix ability to create nameless rooms
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
  "Test1":{chat:["old1","old2"],password:"$2b$10$L.86LiNCKoF0z.3.m5UWuuZsvOW7QNrju88dOZy22.AUMvVq/7D.m"},
  "Test2":{chat:["old1","old2"],password:false},
  "room420":{chat:["lol","much funny"],password:false}
}




//express routes
app.get("/RoomList", (req, res) => {
  let data={
    rooms:Object.keys(tdb)
  }
  res.json(data)
});

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


//socket.io routes
io.on("connection", socket => {
  console.log("New client connected");



  socket.on('startRoom',(data)=>{
    const room=data.room;
    console.log("New client connected");

    if(tdb.hasOwnProperty(data.room)){
      bcrypt.compare(data.password, tdb[data.room].password, function(err, result) {
        if(result || tdb[data.room].password===false){
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