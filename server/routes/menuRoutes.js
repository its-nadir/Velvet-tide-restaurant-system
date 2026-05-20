const express = require("express");
const {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const adminTokenAuth = require("../middlewares/adminTokenAuth");

const router = express.Router();

router.get("/", getMenuItems);
router.post("/", adminTokenAuth, createMenuItem);
router.patch("/:id", adminTokenAuth, updateMenuItem);
router.delete("/:id", adminTokenAuth, deleteMenuItem);

module.exports = router;
