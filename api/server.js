const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const helmet = require('helmet');

require('dotenv').config();

//express set up
const app = express();

const port = process.env.PORT;
const server=app.listen(port, () => {
  console.log("Listening to port " + port);
});

app.use(helmet())
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
require('./express-error-handler.js')(app);


// mysql set up
const connection = mysql.createConnection({
  host     : process.env.HOST,
  user     : 'root',
  password : process.env.PASSWORD,
  database : 'my_chat_rooms'
});
connection.connect();


//socket.io set up
const io = socketIo(server);
io.set('origins', '*:*');

require('./express-routes.js')(app, connection);
require('./socket-events.js')(io, connection)