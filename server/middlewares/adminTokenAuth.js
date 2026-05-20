const jwt = require("jsonwebtoken");

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "velvet-tide-admin-secret";

/**
 * Lightweight admin auth middleware.
 * Only validates the JWT signature and attaches the decoded payload.
 * Avoids the extra DB read performed by the default adminAuth middleware.
 */
const adminTokenAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    req.admin = {
      id: decoded.id,
      email: decoded.email || "",
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = adminTokenAuth;
