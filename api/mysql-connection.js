const mysql = require("mysql");
require('dotenv').config();

const connection = mysql.createConnection({
  host     : process.env.HOST,
  user     : 'root',
  password : process.env.PASSWORD,
  database : 'my_chat_rooms'
});
connection.connect();

module.exports = connection;