const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { getAdminByEmail, getAdminById, invalidateAdminCache } = require("../services/adminCache");
const { toDataUrl, isValidAvatarDataUrl } = require("../utils/avatarUtils");

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "velvet-tide-admin-secret";
const TOKEN_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRES_IN || "12h";

const DEFAULT_ADMIN_AVATAR = "";

const resolveAvatarValue = (avatar) => toDataUrl(avatar) || DEFAULT_ADMIN_AVATAR;

const buildAdminPayload = (admin) => ({
  id: admin._id,
  first_name: admin.first_name,
  last_name: admin.last_name,
  email: admin.email,
  role: admin.role,
  avatar: resolveAvatarValue(admin.avatar),
});

const buildTokenResponse = (admin) => ({
  token: jwt.sign({ id: admin._id }, ADMIN_JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN }),
  admin: buildAdminPayload(admin),
});

const loginAdmin = async (req, res, next) => {
  try {
    const normalizedEmail = req.body.email?.trim().toLowerCase();
    const passwordAttempt = (req.body.password || "").trim();

    if (!normalizedEmail || !passwordAttempt) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const adminDoc = await getAdminByEmail(normalizedEmail);
    if (!adminDoc) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(passwordAttempt, adminDoc.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { password, ...admin } = adminDoc;
    return res.json(buildTokenResponse(admin));
  } catch (error) {
    return next(error);
  }
};

const getCurrentAdmin = async (req, res, next) => {
  try {
    const admin = await getAdminById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.json({ admin: buildAdminPayload(admin) });
  } catch (error) {
    return next(error);
  }
};

const updateCurrentAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const { first_name, last_name, email, password, avatar, current_password: currentPassword } = req.body || {};
    const updates = {};

    if (first_name !== undefined) {
      const trimmed = String(first_name).trim();
      if (!trimmed) {
        return res.status(400).json({ message: "First name is required" });
      }
      updates.first_name = trimmed;
    }

    if (last_name !== undefined) {
      const trimmed = String(last_name).trim();
      if (!trimmed) {
        return res.status(400).json({ message: "Last name is required" });
      }
      updates.last_name = trimmed;
    }

    if (email !== undefined) {
      const trimmed = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmed || !emailRegex.test(trimmed)) {
        return res.status(400).json({ message: "A valid email is required" });
      }
      const emailOwner = await Admin.findOne({ email: trimmed });
      if (emailOwner && emailOwner._id.toString() !== admin._id.toString()) {
        return res.status(409).json({ message: "Email is already in use by another admin" });
      }
      updates.email = trimmed;
    }

    if (password !== undefined && password !== null && password !== "") {
      const trimmedPassword = String(password).trim();
      const trimmedCurrent = String(currentPassword || "").trim();
      if (trimmedPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      if (!trimmedCurrent) {
        return res.status(400).json({ message: "Current password is required to set a new password" });
      }
      const matches = await bcrypt.compare(trimmedCurrent, admin.password || "");
      if (!matches) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      updates.password = await bcrypt.hash(trimmedPassword, 10);
    }

    if (avatar !== undefined) {
      if (!avatar) {
        updates.avatar = "";
      } else if (isValidAvatarDataUrl(avatar)) {
        updates.avatar = avatar.trim();
      } else {
        return res.status(400).json({ message: "Invalid avatar image" });
      }
    }

    if (Object.keys(updates).length > 0) {
      Object.assign(admin, updates);
      await admin.save();
      invalidateAdminCache();
    }

    return res.json({ admin: buildAdminPayload(admin) });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  loginAdmin,
  getCurrentAdmin,
  updateCurrentAdmin,
};
