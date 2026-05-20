const express = require("express");
const {
  getMessages,
  createMessage,
  markMessageAsRead,
  deleteMessage,
  deleteAllMessages,
} = require("../controllers/messageController");
const adminTokenAuth = require("../middlewares/adminTokenAuth");

const router = express.Router();

router.get("/", adminTokenAuth, getMessages);
router.post("/", createMessage);
router.patch("/:id/read", adminTokenAuth, markMessageAsRead);
router.delete("/:id", adminTokenAuth, deleteMessage);
router.delete("/", adminTokenAuth, deleteAllMessages);

module.exports = router;
