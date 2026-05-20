const express = require("express");
const {
  loginAdmin,
  getCurrentAdmin,
  updateCurrentAdmin,
} = require("../controllers/adminController");
const adminTokenAuth = require("../middlewares/adminTokenAuth");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/me", adminTokenAuth, getCurrentAdmin);
router.put("/me", adminTokenAuth, updateCurrentAdmin);

module.exports = router;
