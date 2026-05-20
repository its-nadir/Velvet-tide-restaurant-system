const BUFFER_CHUNK_SIZE = 0x8000;

const isDataUrl = (value) => typeof value === "string" && value.startsWith("data:");

const extractByteArray = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (value instanceof Uint8Array) {
    return value;
  }
  if (typeof value === "object") {
    if (value.type === "Buffer" && Array.isArray(value.data)) {
      return value.data;
    }
    if (value.data != null) {
      return extractByteArray(value.data);
    }
  }
  return null;
};

const bytesToBase64 = (bytes) => {
  if (!bytes || !bytes.length) return "";
  const uint8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (typeof btoa !== "function") return "";
  let binary = "";
  for (let cursor = 0; cursor < uint8.length; cursor += BUFFER_CHUNK_SIZE) {
    const chunk = uint8.subarray(cursor, cursor + BUFFER_CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
};

export const normalizeAvatarForClient = (avatar) => {
  if (!avatar) return "";
  if (typeof avatar === "string") {
    return avatar;
  }
  const source = avatar.data ?? avatar;
  const byteArray = extractByteArray(source);
  if (!byteArray) return "";
  const base64 = bytesToBase64(byteArray);
  if (!base64) return "";
  const mime = avatar.contentType || "image/jpeg";
  return `data:${mime};base64,${base64}`;
};
