const schema = require('./joi-schema.js');
const bcrypt = require("bcrypt");
const saltRounds=10;



module.exports = (app, connection)=>{              //express routes
  app.get("/RoomList", (req, res) => {
    connection.query('SELECT name, IF(password IS NULL, FALSE, TRUE) AS has_password FROM rooms', function (error, results) {
      if (error) {
        console.log("Failed to get room list", error);
        res.json([]);
        return;
      };
      res.json(results)
    });
  });
    
  app.post("/CreateRoom", (req, res) => {
  
    const {error, value} = schema.validate({room:req.body.roomName, password:req.body.password})
    if (error){
      console.log("Invalid user value", error)
      res.send(false);
    }

    const roomName = value.room;
    const password = value.password;

    connection.query('SELECT EXISTS(SELECT * FROM rooms WHERE name=?) AS exists', [roomName], function (error, results) {
      if (error){
        console.log("Database error", error)
        res.send(false);
      }
  
      if (results[0].exists===0){
        if(password===false || password===""){                      //we send a response in both cases because mysql queries are async
          connection.query(`INSERT INTO rooms SET name=?, password=NULL`,[roomName], function (err) {
            if (err){
              console.log("Room creation failed", error)
              res.send(false);
            }
            res.send(true);
          });
        } else {
          console.log(roomName, password)
          bcrypt.hash(password, saltRounds, function(err, hash) {
            if(err){
              console.log("Password hashing failed", error)
              res.send(false);
            }
            connection.query(`INSERT INTO rooms SET name=?, password=?`, [roomName, hash], function (err) {
              if (err){
                console.log("Room creation failed", error)
                res.send(false);
              }
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