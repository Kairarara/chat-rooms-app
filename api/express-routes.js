const schema = require('./joi-schema.js');
const bcrypt = require("bcrypt");
const saltRounds=10;



module.exports = (app, connection)=>{              //express routes

  app.get("/RoomList", (req, res, next) => {
    connection.query('SELECT name, IF(password IS NULL, FALSE, TRUE) AS has_password FROM rooms', function (error, results) {
      if (error) {
        next(error);
        return;
      }
      res.json(results);
    });
  });
    
  app.post("/CreateRoom", (req, res, next) => {
  
    const {error, value} = schema.validate({room:req.body.roomName, password:req.body.password})
    if (error){
      next(error);
      return;
    }

    const roomName = value.room;
    const password = value.password;

    connection.query('SELECT EXISTS(SELECT * FROM rooms WHERE name=?) AS exist', [roomName], function (error, results) {
      if (error){
        next(error);
        return;
      }
  
      if (results[0].exist===0){
        if(password===false || password===""){                      //we send a response in both cases because mysql queries are async
          connection.query(`INSERT INTO rooms SET name=?, password=NULL`,[roomName], function (error) {
            if (error){
              next(error);
              return;
            }
            res.send(true);
          });
        } else {
          console.log(roomName, password)
          bcrypt.hash(password, saltRounds, function(error, hash) {
            if(error){
              next(error);
              return;
            }
            connection.query(`INSERT INTO rooms SET name=?, password=?`, [roomName, hash], function (error) {
              if (error){
                next(error);
                return;
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