const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    table_number: {
      type: Number,
      required: true,
      unique: true,
    },
    position: {
      type: String,
      default: "",
      trim: true,
    },
    number_of_chairs: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
