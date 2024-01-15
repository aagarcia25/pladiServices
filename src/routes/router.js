const express = require("express");
const router = express.Router();

const { verify } = require("../controllers/Verify.js");

const {
  inapGralAll,
  inapGral01All,
} = require("../controllers/Controller_InapGral.js");
const { Login } = require("../controllers/Controller_Login.js");

router.post("/login", (req, res) => {
  Login(req, res);
});

router.get("/verify", (req, res) => {
  verify(req, res);
});

router.post("/inapGralAll", (req, res) => {
  inapGralAll(req, res);
});

router.post("/inapGral01All", (req, res) => {
  inapGral01All(req, res);
});

module.exports = router;
