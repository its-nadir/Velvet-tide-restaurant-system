const express = require("express");
const {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  confirmReservation,
} = require("../controllers/reservationController");
const adminTokenAuth = require("../middlewares/adminTokenAuth");

const router = express.Router();

router.get("/", adminTokenAuth, getReservations);
router.get("/:id", adminTokenAuth, getReservationById);
router.post("/", createReservation);
router.patch("/:id", adminTokenAuth, updateReservation);
router.post("/:id/confirm", adminTokenAuth, confirmReservation);

module.exports = router;
