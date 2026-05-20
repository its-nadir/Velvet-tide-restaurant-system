const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb+srv://userauth:5362@cluster0.pkll8.mongodb.net/restaurant";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

module.exports = connectDB;
