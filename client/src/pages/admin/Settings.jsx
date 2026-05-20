import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminTheme,
  buttonStyle,
  createCardStyle,
  fieldLabelStyle,
  sectionHeadingStyle,
  textInputStyle,
  underlineStyle,
} from "./adminTheme";
import { API_BASE_URL } from "../../config/api";
import { normalizeAvatarForClient } from "../../utils/avatarUtils";
const FALLBACK_AVATAR = "/Photos/img6.jpg";
const ADMIN_PROFILE_EVENT = "adminProfile:updated";

const notifyAdminProfileUpdate = (admin) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADMIN_PROFILE_EVENT, { detail: admin || null }));
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getStoredAdminProfile = () => {
  try {
    return JSON.parse(localStorage.getItem("adminProfile") || "{}");
  } catch {
    return {};
  }
};

const mapAdminToFormState = (admin = {}) => ({
  first_name: admin.first_name || "",
  last_name: admin.last_name || "",
  email: admin.email || "",
  avatar: normalizeAvatarForClient(admin.avatar) || "",
});

export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const fetchControllerRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const storedAdmin = getStoredAdminProfile();
  const initialCachedProfile = Boolean(
    storedAdmin?.first_name || storedAdmin?.last_name || storedAdmin?.email
  );
  const [formState, setFormState] = useState(() => mapAdminToFormState(storedAdmin));
  const [profileBaseline, setProfileBaseline] = useState(() => mapAdminToFormState(storedAdmin));
  const [hasCachedProfile, setHasCachedProfile] = useState(initialCachedProfile);
  const hasCachedProfileRef = useRef(initialCachedProfile);
  const [passwords, setPasswords] = useState({ password: "", confirmPassword: "", currentPassword: "" });
  const [status, setStatus] = useState({ message: "", tone: "" });
  const [loading, setLoading] = useState(!initialCachedProfile);
  const [saving, setSaving] = useState(false);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminProfile");
    notifyAdminProfileUpdate(null);
    navigate("/admin", { replace: true });
  }, [navigate]);

  const updateFormFromAdmin = useCallback((admin = {}) => {
    const normalized = mapAdminToFormState(admin);
    setFormState(normalized);
    setProfileBaseline({ ...normalized });
    setHasCachedProfile(
      Boolean(normalized.first_name || normalized.last_name || normalized.email || normalized.avatar)
    );
  }, []);

  useEffect(() => {
    hasCachedProfileRef.current = hasCachedProfile;
  }, [hasCachedProfile]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const shouldBlockUI = !hasCachedProfileRef.current;
      if (shouldBlockUI) {
        setLoading(true);
      }
      setStatus({ message: "", tone: "" });
      fetchControllerRef.current?.abort();
      const controller = new AbortController();
      fetchControllerRef.current = controller;
      let shouldSkipStateUpdate = false;
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/me`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          signal: controller.signal,
        });
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Unable to load admin profile.");
        }
        const normalizedAdmin = data.admin
          ? {
              ...data.admin,
              avatar: normalizeAvatarForClient(data.admin.avatar),
            }
          : {};
        updateFormFromAdmin(normalizedAdmin);
        if (data.admin) {
          localStorage.setItem("adminProfile", JSON.stringify(normalizedAdmin));
          notifyAdminProfileUpdate(normalizedAdmin);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          shouldSkipStateUpdate = true;
          return;
        }
        if (hasCachedProfileRef.current) {
          setStatus({
            tone: "error",
            message: "Couldn't refresh the admin profile from the server. Showing cached details instead.",
          });
        } else {
          setStatus({ tone: "error", message: error.message });
        }
      } finally {
        if (fetchControllerRef.current === controller) {
          fetchControllerRef.current = null;
        }
        if (!shouldSkipStateUpdate && shouldBlockUI) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, [handleUnauthorized, updateFormFromAdmin]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (status.message) {
      setStatus({ message: "", tone: "" });
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (status.message) {
      setStatus({ message: "", tone: "" });
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ tone: "error", message: "Please select a valid image file." });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({ ...prev, avatar: typeof reader.result === "string" ? reader.result : prev.avatar }));
      setStatus({ message: "", tone: "" });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ message: "", tone: "" });

    const firstName = formState.first_name.trim();
    const lastName = formState.last_name.trim();
    const email = formState.email.trim().toLowerCase();
    const newPassword = passwords.password.trim();
    const confirmPassword = passwords.confirmPassword.trim();
    const currentPassword = passwords.currentPassword.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName || !lastName) {
      setStatus({ tone: "error", message: "First and last name are required." });
      return;
    }

    if (!email || !emailRegex.test(email)) {
      setStatus({ tone: "error", message: "Please provide a valid email address." });
      return;
    }

    const isUpdatingPassword = Boolean(newPassword || confirmPassword || currentPassword);
    if (isUpdatingPassword) {
      if (!newPassword || !confirmPassword) {
        setStatus({ tone: "error", message: "Enter and confirm the new password." });
        return;
      }
      if (newPassword.length < 8) {
        setStatus({ tone: "error", message: "Password must be at least 8 characters long." });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatus({ tone: "error", message: "Password confirmation does not match." });
        return;
      }
      if (!currentPassword) {
        setStatus({ tone: "error", message: "Current password is required to change your password." });
        return;
      }
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
    };

    if (isUpdatingPassword) {
      payload.password = newPassword;
      payload.current_password = currentPassword;
    }

    if (!profileBaseline || profileBaseline.avatar !== formState.avatar) {
      payload.avatar = formState.avatar;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }
      const normalizedAdmin = data.admin
        ? {
            ...data.admin,
            avatar: normalizeAvatarForClient(data.admin.avatar),
          }
        : {};
      updateFormFromAdmin(normalizedAdmin);
      if (data.admin) {
        localStorage.setItem("adminProfile", JSON.stringify(normalizedAdmin));
        notifyAdminProfileUpdate(normalizedAdmin);
      }
      setPasswords({ password: "", confirmPassword: "", currentPassword: "" });
      setStatus({ tone: "success", message: "Profile updated successfully." });
    } catch (error) {
      setStatus({ tone: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = formState.avatar || profileBaseline?.avatar || FALLBACK_AVATAR;
  const disableActions = saving || loading;

  const profileCardStyle = {
    display: "flex",
    flexDirection: windowWidth <= 900 ? "column" : "row",
    gap: "24px",
  };

  const leftColumnStyle = {
    flexBasis: windowWidth <= 900 ? "100%" : "260px",
    borderRight: windowWidth <= 900 ? "none" : `1px solid ${adminTheme.palette.border}`,
    borderBottom: windowWidth <= 900 ? `1px solid ${adminTheme.palette.border}` : "none",
    paddingRight: windowWidth <= 900 ? "0" : "24px",
    paddingBottom: windowWidth <= 900 ? "24px" : "0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
  };

  const avatarFrameStyle = {
    width: 150,
    height: 150,
    borderRadius: "50%",
    border: `3px solid ${adminTheme.palette.border}`,
    overflow: "hidden",
  };

  const condensedGridBase = {
    columnGap: "24px",
    rowGap: "18px",
    maxWidth: windowWidth <= 768 ? "100%" : "520px",
    justifyContent: windowWidth <= 768 ? "stretch" : "flex-start",
  };

  const getFieldWidth = () => (windowWidth <= 768 ? "100%" : "220px");
  const isPhone = windowWidth <= 640;
  const compactFieldWidth = isPhone ? "90%" : "100%";
  const compactFieldMaxWidth = isPhone ? "360px" : condensedGridBase.maxWidth;
  const stackedFullWidthStyle = {
    flex: "0 0 100%",
    width: compactFieldWidth,
    maxWidth: compactFieldMaxWidth,
    alignSelf: isPhone ? "center" : "stretch",
  };

  const profileFieldsGridStyle = {
    flex: 1,
    display: windowWidth <= 768 ? "grid" : "flex",
    columnGap: windowWidth <= 768 ? condensedGridBase.columnGap : "32px",
    rowGap: condensedGridBase.rowGap,
    flexWrap: "wrap",
    maxWidth: condensedGridBase.maxWidth,
    justifyContent: windowWidth <= 768 ? "stretch" : "space-between",
    alignItems: windowWidth <= 768 ? "center" : "flex-start",
  };

  const twoColumnFieldWrapper = () => ({
    flex: windowWidth <= 768 ? "0 0 100%" : "0 0 auto",
    width: windowWidth <= 768 ? compactFieldWidth : getFieldWidth(),
    maxWidth: windowWidth <= 768 ? compactFieldMaxWidth : getFieldWidth(),
    minWidth: windowWidth <= 768 ? compactFieldWidth : "180px",
    alignSelf: windowWidth <= 768 ? "center" : "flex-start",
  });

  const passwordFieldsGridStyle = {
    display: windowWidth <= 768 ? "grid" : "flex",
    columnGap: windowWidth <= 768 ? condensedGridBase.columnGap : "32px",
    rowGap: 16,
    flexWrap: "wrap",
    maxWidth: condensedGridBase.maxWidth,
    justifyContent: windowWidth <= 768 ? "stretch" : "space-between",
    alignItems: windowWidth <= 768 ? "center" : "flex-start",
  };

  return (
    <div style={{ color: adminTheme.palette.contrast, fontFamily: adminTheme.fonts.body }}>
      <div style={{ marginBottom: "32px" }}>

        <h1 style={sectionHeadingStyle}>Personalize Profile</h1>
        <div style={underlineStyle} />

      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            ...createCardStyle({
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }),
          }}
        >
          {status.message && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: adminTheme.radii.md,
                backgroundColor: status.tone === "error" ? "#ffe6e6" : "#e8f7ef",
                color: status.tone === "error" ? "#8a1f1f" : "#0f5132",
                border: `1px solid ${status.tone === "error" ? "#ffb3b3" : "#c6f1d6"}`,
              }}
            >
              {status.message}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", color: adminTheme.palette.textMuted, padding: "32px 0" }}>
              Loading profile...
            </div>
          ) : (
            <>
              <div style={profileCardStyle}>
                <div style={leftColumnStyle}>
                  <div style={avatarFrameStyle}>
                    <img
                      src={avatarSrc}
                      alt="Admin avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        ...buttonStyle("ghost"),
                        width: "auto",
                      }}
                      disabled={disableActions}
                    >
                      Change Picture
                    </button>
                    <button
                      type="button"
                      style={{
                        ...buttonStyle("secondary"),
                        width: "auto",
                      }}
                      onClick={() => setFormState((prev) => ({ ...prev, avatar: "" }))}
                      disabled={disableActions}
                    >
                      Remove
                    </button>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: adminTheme.palette.textMuted, margin: 0 }}>
                    JPG or PNG.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarUpload}
                  />
                </div>

                <div style={profileFieldsGridStyle}>
                  <div style={twoColumnFieldWrapper()}>
                    <label htmlFor="first_name" style={fieldLabelStyle}>
                      First name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      style={textInputStyle}
                      value={formState.first_name}
                      onChange={handleInputChange}
                      disabled={disableActions}
                    />
                  </div>
                  <div style={twoColumnFieldWrapper()}>
                    <label htmlFor="last_name" style={fieldLabelStyle}>
                      Last name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      style={textInputStyle}
                      value={formState.last_name}
                      onChange={handleInputChange}
                      disabled={disableActions}
                    />
                  </div>
                <div style={stackedFullWidthStyle}>
                  <label htmlFor="email" style={fieldLabelStyle}>
                    Contact email
                  </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      style={textInputStyle}
                      value={formState.email}
                      onChange={handleInputChange}
                      disabled={disableActions}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...createCardStyle({
                    padding: "24px",
                    border: `1px dashed ${adminTheme.palette.border}`,
                    backgroundColor: "#faf8f6",
                    boxShadow: "none",
                  }),
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>Change password</div>
                  <p style={{ margin: 0, color: adminTheme.palette.textMuted, fontSize: "0.9rem" }}>
                    Leave blank to keep your current password.
                  </p>
                </div>
                <div
                  style={{
                    ...stackedFullWidthStyle,
                    marginBottom: "18px",
                  }}
                >
                  <label htmlFor="currentPassword" style={fieldLabelStyle}>
                    Current password
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    style={textInputStyle}
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    disabled={disableActions}
                  />
                </div>
                <div style={passwordFieldsGridStyle}>
                  <div style={twoColumnFieldWrapper()}>
                    <label htmlFor="password" style={fieldLabelStyle}>
                      New password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      style={textInputStyle}
                      value={passwords.password}
                      onChange={handlePasswordChange}
                      disabled={disableActions}
                    />
                  </div>
                  <div style={twoColumnFieldWrapper()}>
                    <label htmlFor="confirmPassword" style={fieldLabelStyle}>
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      style={textInputStyle}
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      disabled={disableActions}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              style={buttonStyle("primary", { boxShadow: "none" })}
              disabled={disableActions}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
