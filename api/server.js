const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");

/*
  TO DO: use mysql to store chats
*/


//express set up
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 9000;
const server=app.listen(port, () => {
  console.log("Listening to port " + port);
});

const io = socketIo(server);
io.set('origins', '*:*');
let tdb={                               //todo database
  "Test1":["old1","old2"],
  "Test2":["old1","old2"],
  "room420":["lol","much funny"]
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
        history:tdb[room]
      })
  
      socket.on("chat",(data)=>{
        tdb[room].push(data.message);
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

app.post("/CreateRoom", (req, res) => {
  console.log("req.body.message")
  res.send(req.body.message);
});
