const mongoose = require("mongoose");
const Table = require("../models/Table");
const Reservation = require("../models/Reservation");
const { parseDateInput } = require("../utils/dateUtils");

const getTables = async (_req, res, next) => {
  try {
    const tables = await Table.find().sort({ table_number: 1 });
    res.json(tables);
  } catch (error) {
    next(error);
  }
};

const getAvailableTables = async (req, res, next) => {
  try {
    const guests = Number(req.query.guests) || 1;
    const dateValue = req.query.date;
    const timeValue = (req.query.time || "").trim();
    const reservationId = (req.query.reservationId || "").trim();
    const parsedDate = parseDateInput(dateValue);

    if (!parsedDate || !timeValue) {
      return res.status(400).json({ message: "date and time are required to fetch available tables" });
    }

    const tables = await Table.find({
      number_of_chairs: { $gte: guests },
    }).sort({ table_number: 1 });

    const reservationFilter = {
      reservation_date: parsedDate,
      reservation_time: timeValue,
      status: { $ne: "cancelled" },
      table: { $exists: true, $ne: null },
    };

    if (reservationId && mongoose.Types.ObjectId.isValid(reservationId)) {
      reservationFilter._id = { $ne: reservationId };
    }

    const activeReservations = await Reservation.find(reservationFilter, {
      table: 1,
    });

    const reservedTableIds = new Set(
      activeReservations
        .map((reservation) => reservation.table && reservation.table.toString())
        .filter(Boolean)
    );

    const availableTables = tables.filter(
      (table) => !reservedTableIds.has(table._id.toString())
    );

    res.json(availableTables);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTables,
  getAvailableTables,
};
