const MenuItem = require("../models/MenuItem");

const getMenuItems = async (_req, res, next) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const createMenuItem = async (req, res, next) => {
  try {
    const { name, category, subcategory, price, description, available } = req.body;
    if (!name || !category || !subcategory || price === undefined) {
      return res
        .status(400)
        .json({ message: "Name, category, subcategory, and price are required." });
    }
    const item = await MenuItem.create({
      name: String(name).trim(),
      category: String(category).trim(),
      subcategory: String(subcategory).trim(),
      price: Number(price),
      description: description ? String(description).trim() : "",
      available: typeof available === "boolean" ? available : true,
    });
    res.status(201).json(item.toObject());
  } catch (error) {
    next(error);
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = {};
    const { name, category, subcategory, price, description, available } = req.body;
    if (name !== undefined) updates.name = String(name).trim();
    if (category !== undefined) updates.category = String(category).trim();
    if (subcategory !== undefined) updates.subcategory = String(subcategory).trim();
    if (price !== undefined) updates.price = Number(price);
    if (description !== undefined) updates.description = String(description).trim();
    if (available !== undefined) updates.available = Boolean(available);

    const updated = await MenuItem.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await MenuItem.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
