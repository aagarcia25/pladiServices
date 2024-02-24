const mysql = require("mysql2");

const db_connect = mysql.createConnection({
  host: "database",
  user: "pladiuser",
  database: "pladi",
  password: "pladipassword",
});

db_connect.connect();

module.exports = db_connect;
