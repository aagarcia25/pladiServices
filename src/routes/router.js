const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verify } = require("../controllers/Verify.js");

const {
  inapGralAll,
  inapGral01All,
} = require("../controllers/Controller_InapGral.js");
const { Login } = require("../controllers/Controller_Login.js");
const { AUDITORIA } = require("../controllers/Controller_Auditoria.js");
const { PPI } = require("../controllers/Controller_ppi.js");
const { PF } = require("../controllers/controller_pf.js");
const { siregob } = require("../controllers/Controller_Siregob.js");
const { MPD } = require("../controllers/Controller_mpd.js");
const {
  migrafile,
  getFile,
  saveFile,
  createfolder,
  getListFiles,
  deletedFile,
  deletedFolder,
  busquedaGeneral,
  getFileBusqueda,
} = require("../controllers/Controller_Files.js");

const { presupuesto } = require("../controllers/Controller_presupuestos.js");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/login", (req, res) => {
  Login(req, res);
});

router.get("/verify", (req, res) => {
  verify(req, res);
});

router.post("/PPI", (req, res) => {
  PPI(req, res);
});

router.post("/MPD", (req, res) => {
  MPD(req, res);
});

router.post("/AUDITORIA", (req, res) => {
  AUDITORIA(req, res);
});

router.post("/PF", (req, res) => {
  PF(req, res);
});

router.post("/siregob", (req, res) => {
  siregob(req, res);
});

router.post("/inapGralAll", (req, res) => {
  inapGralAll(req, res);
});

router.post("/inapGral01All", (req, res) => {
  inapGral01All(req, res);
});

router.post("/saveFile", upload.single("file"), (req, res) => {
  saveFile(req, res);
});

router.post("/getFile", upload.single("file"), (req, res) => {
  getFile(req, res);
});

router.post("/createfolder", upload.none(), (req, res) => {
  createfolder(req, res);
});

router.post("/getListFiles", (req, res) => {
  getListFiles(req, res);
});

router.post("/deletedFile", (req, res) => {
  deletedFile(req, res);
});

router.post("/deletedFolder", (req, res) => {
  deletedFolder(req, res);
});

router.post("/migradata", upload.single("file"), (req, res) => {
  migrafile(req, res);
});

router.post("/busquedaGeneral", (req, res) => {
  busquedaGeneral(req, res);
});

router.post("/getFileBusqueda", (req, res) => {
  getFileBusqueda(req, res);
});

router.post("/presupuesto", (req, res) => {
  presupuesto(req, res);
});

module.exports = router;
