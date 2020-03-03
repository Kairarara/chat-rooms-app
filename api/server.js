const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");


/*
  TO DO:  add some server security, check https://owasp.org/
*/
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Gioc0.De1.Dad1',
  database : 'my_chat_rooms'
});

connection.connect();

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

//express routes
app.get("/RoomList", (req, res) => {
  connection.query('SELECT name, IF(password IS NULL, FALSE, TRUE) AS has_password FROM rooms', function (error, results, fields) {
    if (error) throw error;
    res.json(results)
  });
});

app.post("/CreateRoom", (req, res) => {
  let nameIsValid=(name)=>{
    roomInDb=false;
    connection.query('SELECT COUNT(*) AS count FROM rooms WHERE name=?', [name], function (error, results, fields) {
      if (error) throw error;
      if(results[0].count>0) roomInDb=true;
    });

    if(
      name.length>20 ||
      name.length<4 ||
      roomInDb
    ){
      return false;
    } else {
      return true;
    }
  }
  
  let pwIsValid=(pw)=>{
    if(pw.length>20){
      return false
    } else {
      return true;
    }
  }

  let data=nameIsValid(req.body.roomName)===true && pwIsValid(req.body.password)

  if (data){
    if(req.body.password===false || req.body.password===""){
      connection.query(`INSERT INTO rooms SET name=?, password=NULL`,[req.body.roomName], function (err, results) {
        if (err) throw err;
        res.send(data);
      });
    } else {
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        connection.query(`INSERT INTO rooms SET name=?, password=?`, [req.body.roomName, hash], function (err, results) {
          if (err) throw err;
          res.send(data);
        });
      });
    }
  } else {
    res.send(data)
  }

});

//socket.io routes
io.on("connection", socket => {
  console.log("New client connected");



  socket.on('startRoom',(data)=>{
    const room=data.room;
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
                if(data.message!==""){
                  let newData=data;
                  newData.room_name=room;
                  if(newData.username==="") newData.username="Anon"
                  console.log(newData)
                  connection.query(`INSERT INTO chat_history SET ?`, newData, function (err, results, fields) {
                    if(err) throw err;
                    connection.query('UPDATE rooms SET rooms.last_update=NOW() WHERE  rooms.name=?', [room], (err)=>{
                      if (err) throw err;
                    })
                    io.to(room).emit('chat',newData);
                  })
                }
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