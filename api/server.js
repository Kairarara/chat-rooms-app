const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");

require('dotenv').config();


// mysql set up
const connection = mysql.createConnection({
  host     : process.env.HOST,
  user     : 'root',
  password : process.env.PASSWORD,
  database : 'my_chat_rooms'
});
connection.connect();

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

require('./express-routes.js')(app, connection);
require('./socket-events.js')(io, connection)