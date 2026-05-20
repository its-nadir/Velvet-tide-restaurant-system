const express = require("express");
const { getTables, getAvailableTables } = require("../controllers/tableController");
const adminTokenAuth = require("../middlewares/adminTokenAuth");

const router = express.Router();

router.get("/", adminTokenAuth, getTables);
router.get("/available", getAvailableTables);

module.exports = router;
