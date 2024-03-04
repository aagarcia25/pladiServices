const mysql = require("mysql2");

const db_connect = mysql.createConnection({
  //host: "database",
  host: "10.200.4.176",
  user: "root",
  database: "pladi",
  password: "root",
});
//console.log(db_connect);
db_connect.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:", err);
    return;
  }
  console.log("Conexión exitosa a la base de datos");
  // Resto de tu lógica aquí
});

module.exports = db_connect;
