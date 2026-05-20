const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const { parseDateInput } = require("../utils/dateUtils");

const formatReservation = (reservation) => reservation;

const purgeOldReservations = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await Reservation.deleteMany({ reservation_date: { $lt: today } });
};

const clampNumber = (value, { min, max, fallback }) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;
  return parsed;
};

const buildDateRangeFilter = (fromValue, toValue) => {
  const parsedFrom = parseDateInput(fromValue);
  const parsedTo = parseDateInput(toValue);
  if (!parsedFrom && !parsedTo) return null;
  const range = {};
  if (parsedFrom) {
    range.$gte = parsedFrom;
  }
  if (parsedTo) {
    const endOfDay = new Date(parsedTo);
    endOfDay.setUTCHours(23, 59, 59, 999);
    range.$lte = endOfDay;
  }
  return range;
};

const buildSearchFilter = (searchQuery = "") => {
  const trimmed = searchQuery.trim();
  if (!trimmed) return null;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");
  return [
    { guest_name: regex },
    { phone_number: regex },
    { notes: regex },
  ];
};

const getReservations = async (req, res, next) => {
  try {
    await purgeOldReservations();
    const {
      status,
      from,
      to,
      search,
      page: pageParam,
      limit: limitParam,
    } = req.query || {};

    const filter = {};
    if (status && status !== "all") {
      filter.status = String(status).toLowerCase();
    }

    const dateRange = buildDateRangeFilter(from, to);
    if (dateRange) {
      filter.reservation_date = dateRange;
    }

    const searchConditions = buildSearchFilter(search);
    if (searchConditions) {
      filter.$or = searchConditions;
    }

    const limit = clampNumber(limitParam, { min: 1, max: 500, fallback: null });
    const page = clampNumber(pageParam, { min: 1, max: Number.MAX_SAFE_INTEGER, fallback: 1 });

    const baseQuery = Reservation.find(filter)
      .sort({ reservation_date: 1, reservation_time: 1 })
      .populate("table")
      .lean();

    if (limit) {
      const total = await Reservation.countDocuments(filter);
      const reservations = await baseQuery.skip((page - 1) * limit).limit(limit);
      return res.json({
        data: reservations.map(formatReservation),
        pagination: {
          total,
          limit,
          page,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    const reservations = await baseQuery;
    return res.json(reservations.map(formatReservation));
  } catch (error) {
    next(error);
  }
};

const createReservation = async (req, res, next) => {
  try {
    const {
      guest_name,
      name,
      phone_number,
      phone,
      number_of_persons,
      guests,
      reservation_date,
      date,
      reservation_time,
      time,
      notes,
      message,
      status = "pending",
      created_by,
      updated_by,
      table,
      table_id,
      table_selection,
    } = req.body;

    const sanitizedGuestName = (guest_name || name || "").trim();
    const sanitizedPhoneNumber = (phone_number || phone || "").trim();
    const sanitizedNotes = (notes || message || "").trim();
    const parsedGuests = Number(
      number_of_persons !== undefined ? number_of_persons : guests !== undefined ? guests : NaN
    );
    const parsedReservationDate = parseDateInput(reservation_date || date);
    const sanitizedReservationTime = (reservation_time || time || "").trim();
    const requestedTableId = (table || table_id || table_selection || "").trim();

    const missingFields = [];
    if (!sanitizedGuestName) missingFields.push("guest_name");
    if (!sanitizedPhoneNumber) missingFields.push("phone_number");
    if (Number.isNaN(parsedGuests) || parsedGuests < 1) missingFields.push("number_of_persons");
    if (!parsedReservationDate) missingFields.push("reservation_date");
    if (!sanitizedReservationTime) missingFields.push("reservation_time");
    if (!status) missingFields.push("status");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required reservation fields",
        fields: missingFields,
      });
    }

    const normalizedStatus = (status || "pending").toLowerCase();

    const createdById = created_by && created_by !== ""
      ? created_by
      : null;
    const updatedById = updated_by && updated_by !== ""
      ? updated_by
      : null;

    if (createdById && !mongoose.Types.ObjectId.isValid(createdById)) {
      return res.status(400).json({ message: "created_by must be a valid admin ID" });
    }

    if (updatedById && !mongoose.Types.ObjectId.isValid(updatedById)) {
      return res.status(400).json({ message: "updated_by must be a valid admin ID" });
    }

    let assignedTable = null;
    if (requestedTableId) {
      if (!mongoose.Types.ObjectId.isValid(requestedTableId)) {
        return res.status(400).json({ message: "table must be a valid table ID" });
      }

      assignedTable = await Table.findById(requestedTableId);
      if (!assignedTable) {
        return res.status(404).json({ message: "Selected table was not found" });
      }

      if (assignedTable.number_of_chairs < parsedGuests) {
        return res.status(400).json({
          message: "Selected table cannot seat the specified number of guests",
        });
      }

      const conflictingReservation = await Reservation.findOne({
        table: assignedTable._id,
        reservation_date: parsedReservationDate,
        reservation_time: sanitizedReservationTime,
        status: { $ne: "cancelled" },
      });

      if (conflictingReservation) {
        return res.status(400).json({
          message: "Selected table is already reserved for the requested date and time",
        });
      }
    }

    const reservation = await Reservation.create({
      guest_name: sanitizedGuestName,
      phone_number: sanitizedPhoneNumber,
      number_of_persons: parsedGuests,
      reservation_date: parsedReservationDate,
      reservation_time: sanitizedReservationTime,
      notes: sanitizedNotes,
      status: normalizedStatus,
      created_by: createdById,
      updated_by: updatedById,
      confirmed_at: normalizedStatus === "confirmed" ? new Date() : null,
      cancelled_at: normalizedStatus === "cancelled" ? new Date() : null,
      table: assignedTable ? assignedTable._id : null,
    });

    res.status(201).json(formatReservation(reservation.toObject()));
  } catch (error) {
    next(error);
  }
};

const updateReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid reservation ID" });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const {
      status,
      reservation_date,
      reservation_time,
      number_of_persons,
      notes,
      updated_by,
      table,
      table_id,
      table_selection,
      guest_name,
      name,
      phone_number,
      phone,
    } = req.body;

    const updateDoc = {};
    if (guest_name !== undefined || name !== undefined) {
      const sanitizedGuestName = String(guest_name ?? name ?? "").trim();
      if (!sanitizedGuestName) {
        return res.status(400).json({ message: "guest_name must not be empty" });
      }
      updateDoc.guest_name = sanitizedGuestName;
    }

    if (phone_number !== undefined || phone !== undefined) {
      const sanitizedPhoneNumber = String(phone_number ?? phone ?? "").trim();
      if (!sanitizedPhoneNumber) {
        return res.status(400).json({ message: "phone_number must not be empty" });
      }
      updateDoc.phone_number = sanitizedPhoneNumber;
    }

    const normalizedStatus = status ? status.toLowerCase() : null;
    if (normalizedStatus) {
      updateDoc.status = normalizedStatus;
      if (normalizedStatus === "confirmed") {
        updateDoc.confirmed_at = new Date();
        updateDoc.cancelled_at = null;
      } else if (normalizedStatus === "cancelled") {
        updateDoc.cancelled_at = new Date();
      }
    }

    if (notes !== undefined) {
      updateDoc.notes = String(notes).trim();
    }

    if (number_of_persons !== undefined) {
      const parsedGuests = Number(number_of_persons);
      if (Number.isNaN(parsedGuests) || parsedGuests < 1) {
        return res.status(400).json({ message: "number_of_persons must be a positive number" });
      }
      updateDoc.number_of_persons = parsedGuests;
    }

    let parsedDate = null;
    if (reservation_date !== undefined) {
      parsedDate = parseDateInput(reservation_date);
      if (!parsedDate) {
        return res.status(400).json({ message: "reservation_date must be a valid date" });
      }
      updateDoc.reservation_date = parsedDate;
    }

    let sanitizedTime = null;
    if (reservation_time !== undefined) {
      sanitizedTime = String(reservation_time).trim();
      if (!sanitizedTime) {
        return res.status(400).json({ message: "reservation_time is required when provided" });
      }
      updateDoc.reservation_time = sanitizedTime;
    }

    const updatedById = updated_by && updated_by !== "" ? updated_by : null;
    if (updatedById && !mongoose.Types.ObjectId.isValid(updatedById)) {
      return res.status(400).json({ message: "updated_by must be a valid admin ID" });
    }
    if (updatedById) {
      updateDoc.updated_by = updatedById;
    }

    const requestedTableId = (table || table_id || table_selection || "").trim();
    const effectiveGuests =
      updateDoc.number_of_persons !== undefined ? updateDoc.number_of_persons : reservation.number_of_persons;
    const effectiveDate = parsedDate || reservation.reservation_date;
    const effectiveTime = sanitizedTime || reservation.reservation_time;

    if (requestedTableId) {
      if (!mongoose.Types.ObjectId.isValid(requestedTableId)) {
        return res.status(400).json({ message: "table must be a valid table ID" });
      }

      const assignedTable = await Table.findById(requestedTableId);
      if (!assignedTable) {
        return res.status(404).json({ message: "Selected table was not found" });
      }

      if (assignedTable.number_of_chairs < effectiveGuests) {
        return res.status(400).json({
          message: "Selected table cannot seat the specified number of guests",
        });
      }

      const conflictingReservation = await Reservation.findOne({
        _id: { $ne: reservation._id },
        table: assignedTable._id,
        reservation_date: effectiveDate,
        reservation_time: effectiveTime,
        status: { $ne: "cancelled" },
      });

      if (conflictingReservation) {
        return res.status(400).json({
          message: "Selected table is already reserved for the requested date and time",
        });
      }

      updateDoc.table = assignedTable._id;
    } else if (table === null || table_id === null || table_selection === null) {
      updateDoc.table = null;
    }

    if (Object.keys(updateDoc).length === 0) {
      const populatedReservation = await reservation.populate("table");
      return res.json(formatReservation(populatedReservation.toObject()));
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(id, updateDoc, {
      new: true,
    })
      .populate("table")
      .lean();

    res.json(formatReservation(updatedReservation));
  } catch (error) {
    next(error);
  }
};

const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid reservation ID" });
    }
    const reservation = await Reservation.findById(id).populate("table").lean();
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json(formatReservation(reservation));
  } catch (error) {
    next(error);
  }
};

const confirmReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid reservation ID" });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const { table, table_id, table_selection, updated_by } = req.body;
    const tableId = (table || table_id || table_selection || "").trim();
    if (!tableId) {
      return res.status(400).json({ message: "A table assignment is required to confirm" });
    }

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return res.status(400).json({ message: "table must be a valid table ID" });
    }

    const assignedTable = await Table.findById(tableId);
    if (!assignedTable) {
      return res.status(404).json({ message: "Selected table was not found" });
    }

    if (assignedTable.number_of_chairs < reservation.number_of_persons) {
      return res
        .status(400)
        .json({ message: "Selected table cannot seat the specified number of guests" });
    }

    const conflictingReservation = await Reservation.findOne({
      _id: { $ne: reservation._id },
      table: assignedTable._id,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      status: { $ne: "cancelled" },
    });

    if (conflictingReservation) {
      return res
        .status(400)
        .json({ message: "Selected table is already reserved for the requested date and time" });
    }

    reservation.table = assignedTable._id;
    reservation.status = "confirmed";
    reservation.confirmed_at = new Date();
    reservation.cancelled_at = null;
    if (updated_by && mongoose.Types.ObjectId.isValid(updated_by)) {
      reservation.updated_by = updated_by;
    }

    const updatedReservation = await reservation.save();
    await updatedReservation.populate("table");
    res.json(formatReservation(updatedReservation.toObject()));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReservations,
  createReservation,
  updateReservation,
  getReservationById,
  confirmReservation,
  purgeOldReservations,
};
