const schema = require('./joi-schema.js');
const bcrypt = require("bcrypt");
require('dotenv').config();

module.exports = (app, connection)=>{              //express routes
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
          console.log(error, value)
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
              bcrypt.hash(password, process.env.SALT, function(err, hash) {
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
}