const mongoose = require("mongoose");

const openingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      trim: true,
    },
    openHour: {
      type: String,
      required: true,
      trim: true,
    },
    closeHour: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OpeningHour", openingHourSchema);

