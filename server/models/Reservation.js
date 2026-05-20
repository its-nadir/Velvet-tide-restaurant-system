const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    reservationId: {
      type: String,
      unique: true,
      sparse: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    guest_name: {
      type: String,
      required: true,
      trim: true,
    },
    phone_number: {
      type: String,
      required: true,
      trim: true,
    },
    number_of_persons: {
      type: Number,
      required: true,
      min: 1,
    },
    reservation_date: {
      type: Date,
      required: true,
    },
    reservation_time: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    confirmed_at: {
      type: Date,
      default: null,
    },
    cancelled_at: {
      type: Date,
      default: null,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
    },
  },
  { timestamps: true }
);

reservationSchema.pre("validate", function handleReservationId(next) {
  if (!this.reservationId) {
    this.reservationId = new mongoose.Types.ObjectId().toString();
  }
  next();
});

reservationSchema.index(
  { reservationId: 1 },
  {
    unique: true,
    partialFilterExpression: { reservationId: { $type: "string" } },
  }
);

reservationSchema.index({ reservation_date: 1, reservation_time: 1 });
reservationSchema.index({ table: 1, reservation_date: 1, reservation_time: 1 });
reservationSchema.index({ status: 1, reservation_date: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
