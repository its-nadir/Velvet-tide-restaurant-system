const Admin = require("../models/Admin");
const { toDataUrl } = require("../utils/avatarUtils");

const CACHE_TTL_MS = Number(process.env.ADMIN_CACHE_TTL_MS) || 60_000; // 1 minute default

const caches = {
  byId: new Map(),
  byEmail: new Map(),
};

const normalizeEmail = (value) => (value || "").trim().toLowerCase();

const now = () => Date.now();

const isEntryFresh = (entry) => entry && now() - entry.timestamp < CACHE_TTL_MS;

const cloneAdmin = (admin) => {
  if (!admin) return null;
  const cloned = {
    ...admin,
    _id: admin._id?.toString ? admin._id.toString() : admin._id,
    email: normalizeEmail(admin.email),
  };
  cloned.avatar = toDataUrl(admin.avatar);
  return cloned;
};

const cacheAdmin = (admin) => {
  if (!admin) return null;
  const cloned = cloneAdmin(admin);
  const entry = { doc: cloned, timestamp: now() };
  caches.byId.set(cloned._id, entry);
  if (cloned.email) {
    caches.byEmail.set(cloned.email, entry);
  }
  return cloned;
};

const clearCache = () => {
  caches.byId.clear();
  caches.byEmail.clear();
};

const getAdminByEmail = async (email) => {
  if (!email) return null;
  const key = normalizeEmail(email);
  const cached = caches.byEmail.get(key);
  if (isEntryFresh(cached)) {
    return cached.doc;
  }
  const admin = await Admin.findOne({ email: key }).select("+password").lean();
  return cacheAdmin(admin);
};

const getAdminById = async (id) => {
  if (!id) return null;
  const cached = caches.byId.get(id.toString());
  if (isEntryFresh(cached)) {
    return cached.doc;
  }
  const admin = await Admin.findById(id).select("+password").lean();
  return cacheAdmin(admin);
};

module.exports = {
  getAdminByEmail,
  getAdminById,
  invalidateAdminCache: clearCache,
};
