const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const Joi = require('@hapi/joi');

require('dotenv').config();


// mysql set up
const connection = mysql.createConnection({
  host     : process.env.HOST,
  user     : 'root',
  password : process.env.PASSWORD,
  database : 'my_chat_rooms'
});
connection.connect();

//salt rounds for bcrypt
const saltRounds = 10;


//schema for Joi
const schema= Joi.object({
  username: Joi.string()
              .allow('')
              .alphanum()
              .max(20),

  
  room: Joi.string()
          .alphanum()
          .min(4)
          .max(20),

  password: Joi.string()
              .allow('')
              .alphanum()
              .max(20),

  message: Joi.string()
              .max(255),
})


//express set up
const app = express();

const port = process.env.PORT;
const server=app.listen(port, () => {
  console.log("Listening to port " + port);
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//socket.io set up
const io = socketIo(server);
io.set('origins', '*:*');




//express routes
app.get("/RoomList", (req, res) => {
  connection.query('SELECT name, IF(password IS NULL, FALSE, TRUE) AS has_password FROM rooms', function (error, results, fields) {
    if (error) throw error;
    res.json(results)
  });
});

app.post("/CreateRoom", (req, res) => {

  const {error, value} = schema.validate({room:req.body.roomName, password:req.body.password})
  if (error){
    res.send(false);
    return
  }
  
  const roomName = value.room;
  const password = value.password;

  connection.query('SELECT COUNT(*) AS count FROM rooms WHERE name=?', [roomName], function (error, results, fields) {
    if (error) throw error;

    if (results[0].count===0){
      if(password===false || password===""){                      //we send a response in both cases because mysql queries are async
        connection.query(`INSERT INTO rooms SET name=?, password=NULL`,[roomName], function (err, results) {
          if (err) throw err;
          res.send(true);
        });
      } else {
        bcrypt.hash(password, saltRounds, function(err, hash) {
          connection.query(`INSERT INTO rooms SET name=?, password=?`, [roomName, hash], function (err, results) {
            if (err) throw err;
            res.send(true);
          });
        });
      }
    } else {
      res.send(false)
    }
  });
});

//socket.io routes
io.on("connection", socket => {
  console.log("New client connected");

  socket.on('startRoom',(data)=>{

    const {error, value} = schema.validate({room:data.room})
    if(error){
      socket.emit("failedAccess");
      return;
    }

    const room=value.room;

    connection.query(`SELECT * FROM rooms WHERE name=?`, [room], function (err, results, fields) {
      if(err) throw err;
      if(results.length>0){
        bcrypt.compare(data.password, results[0].password, function(err, result) {
          if(result || results[0].password===null){
            socket.join(room,()=>{
              connection.query(`SELECT * FROM chat_history WHERE room_name=? ORDER BY created_at DESC`, [room], function (err, results, fields) {
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
                
                connection.query(`INSERT INTO chat_history SET ?`, newData, function (err, results, fields) {
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
          } else {
            socket.emit("failedAccess")
          }
        })
      } else {
        socket.emit("failedAccess")
      }
    })

    socket.on("disconnect", () => console.log("Client disconnected"));
  });
})