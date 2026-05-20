const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    contactInfo: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);

