const express = require("express");
const session = require("express-session");
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

//socket.io set up
const io = socketIo(server);
io.set('origins', '*:*');

//session set up
const secret = process.env.SECRET || "vC7*EqraC";
const sessionMiddlewere=session({
  secret:secret,
  resave:false,
  saveUninitialized:false,
  cookie:{expires:false}
})

app.use(sessionMiddlewere)
io.use((socket,next)=>{
  sessionMiddlewere(socket.request, socket.request.res, next)
})

let tdb={                               //todo database
  "Test1":{chat:["old1","old2"],password:"a"},
  "Test2":{chat:["old1","old2"],password:""},
  "room420":{chat:["lol","much funny"],password:""}
}

io.on("connection", socket => {
  console.log("New client connected");


  socket.on('startRoom',(data)=>{
    const room=data.room;

    if(socket.request.session.authorizedRooms && socket.request.session.authorizedRooms.includes(room)){
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
    }

  })


  socket.on("disconnect", () => console.log("Client disconnected"));
});


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


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

app.post("/EnterRoom",(req,res)=>{
  if(tdb.hasOwnProperty(req.body.name)){
    let hashedPw=req.body.password;
    if(tdb[req.body.name].password===hashedPw){
      if(req.session.hasOwnProperty("authorizedRooms")){
        req.session.authorizedRooms.push(req.body.name);
      } else {
        req.session.authorizedRooms=[req.body.name]
      }
      res.send("success")
    } else {
      res.send("failure")
    }
  } else {
    res.send("failure")
  }
})