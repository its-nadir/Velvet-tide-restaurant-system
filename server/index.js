if (typeof process.loadEnvFile === "function") {
  process.loadEnvFile();
}

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const reservationRoutes = require("./routes/reservationRoutes");
const tableRoutes = require("./routes/tableRoutes");
const messageRoutes = require("./routes/messageRoutes");
const menuRoutes = require("./routes/menuRoutes");
const errorHandler = require("./middlewares/errorHandler");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/menu", menuRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
