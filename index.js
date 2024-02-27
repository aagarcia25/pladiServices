const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// set up port
const PORT = 8585;
const HOST = "0.0.0.0";
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// add routes
const router = require("./src/routes/router");
app.use("/api/pladi", router);

// run server
const server = app.listen(PORT, HOST, () => {
  const { address, port } = server.address();
  console.log(`Server running on http://${address}:${port}`);
});
