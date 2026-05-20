const ensureBuffer = (value) => {
  if (!value) return null;
  if (Buffer.isBuffer(value)) {
    return value;
  }
  if (value.buffer) {
    if (Buffer.isBuffer(value.buffer)) {
      return Buffer.from(value.buffer);
    }
    if (value.buffer?.buffer) {
      return Buffer.from(value.buffer.buffer);
    }
  }
  if (value._bsontype === "Binary" && value.buffer) {
    return Buffer.from(value.buffer);
  }
  if (value.type === "Buffer" && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }
  if (Array.isArray(value)) {
    return Buffer.from(value);
  }
  return null;
};

const toDataUrl = (avatar) => {
  if (!avatar) return "";
  if (typeof avatar === "string") {
    return avatar;
  }
  const bufferSource = avatar.data || avatar.buffer || avatar;
  const buffer = ensureBuffer(bufferSource);
  if (!buffer || !buffer.length) return "";
  const mime = avatar.contentType || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
};

const isValidAvatarDataUrl = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(trimmed);
};

module.exports = {
  toDataUrl,
  isValidAvatarDataUrl,
};
