const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");


/*
  TO DO:  use mysql to store chats  instead of tdb (test data base)
          add some server security, check https://owasp.org/
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
  connection.query('SELECT name FROM rooms', function (error, results, fields) {
    if (error) throw error;
    res.json(results)
  });
});

app.post("/CreateRoom", (req, res) => {
  let nameIsValid=(name)=>{
    roomInDb=false;
    connection.query('SELECT COUNT(*) AS count FROM rooms WHERE name="'+name+'"', function (error, results, fields) {
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
    connection.query(`CREATE TABLE ${req.body.roomName}(username VARCHAR(20) NOT NULL, message VARCHAR(255) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT NOW());`, function (error, results, fields) {
      if (error) throw error;
    });
    if(req.body.password===false || req.body.password===""){
      connection.query(`INSERT INTO rooms SET name='${req.body.roomName}', password=NULL`, function (error, results, fields) {
        if (error) throw error;
      });
    } else {
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        connection.query(`INSERT INTO rooms SET name='${req.body.roomName}', password="${hash}"`, function (error, results, fields) {
          if (error) throw error;
        });
      });
    }
  }

    res.send(data)
});


//socket.io routes
io.on("connection", socket => {
  console.log("New client connected");



  socket.on('startRoom',(data)=>{
    const room=data.room;
    connection.query(`SELECT * FROM rooms WHERE name="${room}"`, function (err, results, fields) {
      if(err) throw err;
      console.log(results)
      if(results.length>0){
        bcrypt.compare(data.password, results[0].password, function(err, result) {
          if(result || results[0].password===null){
            socket.join(room,()=>{
              connection.query(`SELECT * FROM ${room} ORDER BY created_at DESC LIMIT 50`, function (err, results, fields) {
                if(err) throw err;
                socket.emit('history',{
                  history:results
                })
              })
          
              socket.on("chat",(data)=>{
                if(data.message.message!==""){
                  let newData=data.message
                  if(newData.username==="") newData.username="Anon"
                  connection.query(`INSERT INTO ${room} SET ?`, newData, function (err, results, fields) {
                    if(err) throw err;
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