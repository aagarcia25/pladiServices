const express = require("express");
const router = express.Router();

const { verify } = require("../controllers/Verify.js");

const { inapGralAll } = require("../controllers/Controller_InapGral.js");

router.get("/verify", (req, res) => {
  verify(req, res);
});

router.get("/inapGralAll", (req, res) => {
  inapGralAll(req, res);
});

module.exports = router;
