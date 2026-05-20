const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);

