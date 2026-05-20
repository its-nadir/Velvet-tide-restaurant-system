const Message = require("../models/Message");

const sanitizeInput = (value = "") => String(value).trim();

const getMessages = async (_req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    return res.json(messages);
  } catch (error) {
    return next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedMessage = sanitizeInput(message);

    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      return res.status(400).json({ message: "Name, email, and message are required." });
    }

    const entry = await Message.create({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizeInput(phone),
      subject: sanitizeInput(subject),
      message: sanitizedMessage,
      is_read: false,
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

const markMessageAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(
      id,
      { is_read: true },
      { new: true }
    ).lean();
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }
    return res.json(message);
  } catch (error) {
    return next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Message not found." });
    }
    return res.json({ message: "Message deleted." });
  } catch (error) {
    return next(error);
  }
};

const deleteAllMessages = async (_req, res, next) => {
  try {
    await Message.deleteMany({});
    return res.json({ message: "All messages deleted." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMessages,
  createMessage,
  markMessageAsRead,
  deleteMessage,
  deleteAllMessages,
};
