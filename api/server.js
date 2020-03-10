const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
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

app.use("/",require("./express-routes"))
app.use(require("./express-error-handler"));


//socket.io set up
const io = socketIo(server);
io.set('origins', '*:*');


let buckets={};

require('./socket-events.js')(io, buckets)
