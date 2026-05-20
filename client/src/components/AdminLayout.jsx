import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  adminTheme,
  buttonStyle,
} from "../pages/admin/adminTheme";
import { API_BASE_URL } from "../config/api";
import { normalizeAvatarForClient } from "../utils/avatarUtils";
const ADMIN_PROFILE_EVENT = "adminProfile:updated";

const navItems = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    description: "Pulse of the dining room",
    icon: "dashboard",
    image: "/Photos/profile-main.jpg",
  },
  {
    path: "/admin/reservations",
    label: "Reservations",
    description: "Guests & seating flow",
    icon: "reservations",
    image: "/Photos/profile-1.jpg",
  },
  {
    path: "/admin/management",
    label: "Management",
    description: "Menu & content suite",
    icon: "menu",
    image: "/Photos/profile-2.jpg",
  },
  {
    path: "/admin/messages",
    label: "Messages",
    description: "Guest outreach",
    icon: "messages",
    image: "/Photos/profile-4.jpg",
  },
  {
    path: "/admin/settings",
    label: "Settings",
    description: "House preferences",
    icon: "settings",
    image: "/Photos/profile-3.jpg",
  },
];

const fallbackAdminProfile = {
  name: "Maison Admin",
  role: "Curator",
  avatar: "/Photos/img6.jpg",
};

const normalizeAdminProfile = (adminLike) => {
  if (!adminLike || !adminLike.first_name) {
    return fallbackAdminProfile;
  }
  const fullName = `${adminLike.first_name || ""} ${adminLike.last_name || ""}`.trim();
  const avatar = normalizeAvatarForClient(adminLike.avatar) || fallbackAdminProfile.avatar;
  return {
    name: fullName || fallbackAdminProfile.name,
    role: adminLike.role || fallbackAdminProfile.role,
    avatar,
  };
};

const buildStoredAdminProfile = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("adminProfile") || "{}");
    return normalizeAdminProfile(stored);
  } catch {
    return fallbackAdminProfile;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const headerAlertIcons = [{ id: "messages", icon: "message" }];

const HeaderIconGraphic = ({ type, color }) => {
  const stroke = color || adminTheme.palette.contrast;
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (type) {
    case "bell":
      return (
        <img src="/Icons/notification.png" alt="notifications" style={{ width: 22, height: 22 }} />
      );
    case "message":
      return (
        <img src="/Icons/messages.png" alt="messages" style={{ width: 22, height: 22 }} />
      );
    case "calendar":
    default:
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <line x1="3" y1="11" x2="21" y2="11" />
          <line x1="8" y1="3" x2="8" y2="7" />
          <line x1="16" y1="3" x2="16" y2="7" />
        </svg>
      );
  }
};

const Icon = ({ name, color }) => {
  const stroke = color || adminTheme.palette.contrast;
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case "reservations":
      return (
        <img src="/Icons/reservation.png" alt="reservations" style={{ width: 22, height: 22 }} />
      );
    case "menu":
      return (
        <img src="/Icons/management.png" alt="management" style={{ width: 22, height: 22 }} />
      );
    case "settings":
      return (
        <img src="/Icons/setting.png" alt="settings" style={{ width: 22, height: 22 }} />
      );
    case "messages":
      return (
        <img src="/Icons/messages.png" alt="messages" style={{ width: 22, height: 22 }} />
      );
  }
};

const LogoutGlyph = ({ color = "#fff", size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 17l5-5-5-5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 12H9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 21v1a2 2 0 01-2 2H5a2 2 0 01-2-2V2a2 2 0 012-2h8a2 2 0 012 2v1"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState(buildStoredAdminProfile);
  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminProfile");
    setAdminProfile(fallbackAdminProfile);
    navigate("/admin", { replace: true });
  }, [navigate]);
  const renderedChildren = children ?? <Outlet />;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width > 1024) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/admin", { replace: true });
    } else {
      setAdminProfile(buildStoredAdminProfile());
    }
  }, [navigate]);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        handleUnauthorized();
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/me`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Unable to refresh admin profile.");
        }
        if (data.admin) {
          const sanitizedAdmin = {
            ...data.admin,
            avatar: normalizeAvatarForClient(data.admin.avatar),
          };
          localStorage.setItem("adminProfile", JSON.stringify(sanitizedAdmin));
          window.dispatchEvent(new CustomEvent(ADMIN_PROFILE_EVENT, { detail: sanitizedAdmin }));
          setAdminProfile(normalizeAdminProfile(sanitizedAdmin));
        }
      } catch (error) {
        // keep existing profile if fetch fails
        console.error("Failed to refresh admin profile:", error);
      }
    };
    fetchAdminProfile();
  }, [handleUnauthorized]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleProfileRefresh = (event) => {
      if (event?.detail) {
        setAdminProfile(normalizeAdminProfile(event.detail));
        return;
      }
      setAdminProfile(buildStoredAdminProfile());
    };

    window.addEventListener(ADMIN_PROFILE_EVENT, handleProfileRefresh);
    return () => window.removeEventListener(ADMIN_PROFILE_EVENT, handleProfileRefresh);
  }, []);

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const isMobile = windowWidth <= 768;
  const showSidebar = !isMobile;
  const shouldOverlaySidebar = !isMobile && windowWidth <= 1024;
  const sidebarWidth = showSidebar ? (shouldOverlaySidebar ? windowWidth : 240) : 0;

  const handleLogout = () => {
    handleUnauthorized();
  };

  const handleHeaderIconClick = (iconId) => {
    if (iconId === "messages") {
      navigate("/admin/messages");
    }
  };

  const renderHeaderAlertButtons = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "8px" : "4px",
      }}
    >
      {headerAlertIcons.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleHeaderIconClick(item.id)}
          style={{
            width: isMobile ? "40px" : "42px",
            height: isMobile ? "40px" : "42px",
            borderRadius: "50%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
          aria-label={item.id}
        >
          <HeaderIconGraphic type={item.icon} color="#fff" />
        </button>
      ))}
    </div>
  );

  const renderProfileTrigger = (variant = "full") => {
    const isCompact = variant === "compact";
    return (
      <button
        type="button"
        onClick={() => setProfileMenuOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCompact ? "center" : "flex-start",
          gap: isCompact ? "0" : "12px",
          background: isCompact ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          cursor: "pointer",
          minWidth: isCompact ? "0" : "200px",
          borderRadius: isCompact ? "50%" : "999px",
          border: isCompact ? "1px solid rgba(255,255,255,0.35)" : "none",
          color: "#fff",
          transition: "box-shadow 0.2s ease, background 0.2s ease",
          width: isCompact ? "44px" : "auto",
          height: isCompact ? "44px" : "auto",
          padding: isCompact ? 0 : undefined,
          boxShadow: profileMenuOpen ? "0 20px 40px rgba(15,23,42,0.35)" : "none",
        }}
        aria-label="Toggle profile menu"
      >
        <img
          src={adminProfile.avatar}
          alt={`${adminProfile.name} profile`}
          style={{
            width: isCompact ? "36px" : "40px",
            height: isCompact ? "36px" : "40px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid rgba(255,255,255,0.85)",
          }}
        />
        {!isCompact && (
          <>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, color: "#fff", marginBottom: 4 }}>
                {adminProfile.name}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#ccc" }}>
                {adminProfile.role}
              </div>
            </div>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "#000",
                border: "1.2px solid #fff",
                transform: profileMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </>
        )}
      </button>
    );
  };

  const mobileNavItems = isMobile
    ? navItems.filter((item) => item.path !== "/admin/messages")
    : navItems;
  const mobileNavButtonSize = 48;
  const mobileNavGap = 10;
  const mobileNavPadding = 32;
  const mobileNavIconCount = mobileNavItems.length + 1; // nav links + logout
  const mobileNavContentWidth =
    mobileNavIconCount * mobileNavButtonSize + (mobileNavIconCount - 1) * mobileNavGap;
  const mobileNavIdealWidth = mobileNavContentWidth + mobileNavPadding;
  const mobileRailAvailableWidth = Math.max(windowWidth - 36, 260);
  const mobileRailNeedsScroll = mobileNavIdealWidth > mobileRailAvailableWidth;
  const mobileRailWidth = mobileRailNeedsScroll ? mobileRailAvailableWidth : mobileNavIdealWidth;

  const renderMobileNavRail = () => (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: `${mobileNavGap}px`,
        padding: mobileRailNeedsScroll ? "12px 14px" : "14px 20px",
        background: "rgba(0,0,0,0.92)",
        borderRadius: "999px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
        backdropFilter: "blur(8px)",
        width: `${mobileRailWidth}px`,
        maxWidth: "calc(100% - 24px)",
        overflowX: mobileRailNeedsScroll ? "auto" : "visible",
        justifyContent: mobileRailNeedsScroll ? "flex-start" : "center",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {mobileNavItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-label={item.label}
            style={{
              width: `${mobileNavButtonSize}px`,
              height: `${mobileNavButtonSize}px`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isActive ? "#5ea34d" : "rgba(255,255,255,0.08)",
              border: isActive ? "2px solid #5ea34d" : "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              textDecoration: "none",
              flex: "0 0 auto",
            }}
          >
            <Icon name={item.icon} color="#fff" />
          </Link>
        );
      })}
      <button
        type="button"
        aria-label="Log out"
        onClick={handleLogout}
        style={{
          width: `${mobileNavButtonSize + 8}px`,
          height: `${mobileNavButtonSize + 8}px`,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.25)",
          background: adminTheme.palette.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flex: "0 0 auto",
          boxShadow: "0 12px 22px rgba(0,0,0,0.35)",
        }}
      >
        <LogoutGlyph color="#fff" size={24} />
      </button>
    </div>
  );

  const profileMenuDropdown =
    profileMenuOpen && (
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 12px)",
          right: 0,
          background: "#fff",
          borderRadius: "16px",
          padding: "12px",
          boxShadow: "0 32px 48px rgba(15,23,42,0.2)",
          border: `1px solid ${adminTheme.palette.border}`,
          minWidth: "210px",
          zIndex: 30,
        }}
      >
        <button
          type="button"
          onClick={() => {
            setProfileMenuOpen(false);
            navigate("/admin/settings");
          }}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            borderRadius: "12px",
            padding: "10px 12px",
            textAlign: "left",
            fontWeight: 600,
            cursor: "pointer",
            color: adminTheme.palette.contrast,
          }}
        >
          Settings
        </button>
        <button
          type="button"
          onClick={() => {
            setProfileMenuOpen(false);
            handleLogout();
          }}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            borderRadius: "12px",
            padding: "10px 12px",
            textAlign: "left",
            fontWeight: 600,
            cursor: "pointer",
            color: "#ff6b35",
          }}
        >
          Log out
        </button>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: adminTheme.fonts.body,
        color: adminTheme.palette.contrast,
        position: "relative",
      }}
    >
      {/* Sidebar */}
      {showSidebar && (
        <aside
          style={{
            width: sidebarOpen ? sidebarWidth : shouldOverlaySidebar ? 0 : sidebarWidth,
            background: "#000",
            color: "#fff",
            transition: "width 0.35s ease",
            overflow: "hidden",
            position: shouldOverlaySidebar ? "fixed" : "sticky",
            top: 0,
            left: 0,
            height: "100vh",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            boxShadow: shouldOverlaySidebar ? "0 30px 80px rgba(0,0,0,0.35)" : "2px 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              padding: "20px 20px 10px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src="/Photos/logo.svg"
                alt="Velvet Tide"
                style={{ height: "48px", width: "auto" }}
              />
            </div>
          </div>

          <nav
            style={{
              padding: "45px 16px 48px",
              flex: 1,
              overflowY: "hidden",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
      {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    padding: "14px 18px",
                    borderRadius: "18px",
                    textDecoration: "none",
                    marginBottom: "10px",
                    background: isActive ? "#000" : "transparent",
                    border: isActive ? "2px solid #5ea34d" : "1px solid transparent",
                    transition: "background 0.3s ease, transform 0.3s ease",
                    color: "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <Icon name={item.icon} color="#fff" />
                    <div
                      style={{
                        fontFamily: adminTheme.fonts.display,
                        letterSpacing: "0.08em",
                        fontSize: "1rem",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div
            style={{
              padding: "18px",
              borderTop: "1px solid #f8f8f83b",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                ...buttonStyle("ghost", {
                  width: "80%",
                  background: adminTheme.palette.accent,
                  borderColor: "rgba(255,255,255,0.35)",
                  color: "#fff",
                  padding: "12px 20px",
                  fontFamily: "dream avenue",
                  fontSize: "1.1em",
                }),
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = adminTheme.palette.accentDark;
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = adminTheme.palette.accent;
                e.target.style.transform = "scale(1)";
              }}
            >
              Log Out
            </button>
          </div>
        </aside>
      )}

      {showSidebar && shouldOverlaySidebar && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 10,
          }}
        />
      )}

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: "80hv", 
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 15,
            background: "#000",
            padding: isMobile ? "12px 28px 12px 20px" : "8px 32px",
            borderBottom: "1px solid #fff",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: isMobile ? "10px" : "16px",
              alignItems: "center",
            }}
          >
            {isMobile ? (
              <>
                <div style={{ flex: 1 }}>
                  <img
                    src="/Photos/logo.svg"
                    alt="Velvet Tide"
                    style={{ height: "40px", width: "auto" }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    justifyContent: "flex-end",
                    paddingRight: "8px",
                  }}
                >
                  {renderHeaderAlertButtons()}
                  <div style={{ position: "relative" }} ref={profileMenuRef}>
                    {renderProfileTrigger("compact")}
                    {profileMenuDropdown}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    flex: 1,
                    minWidth: "260px",
                  }}
                >
                  {shouldOverlaySidebar && (
                    <button
                      onClick={() => setSidebarOpen((prev) => !prev)}
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "18px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        {[0, 1, 2].map((index) => (
                          <span
                            key={index}
                            style={{
                              width: "20px",
                              height: "2px",
                              background: "#fff",
                              borderRadius: "2px",
                            }}
                          />
                        ))}
                      </span>
                    </button>
                  )}
                  <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          style={{
                            width: index === 2 ? "10px" : "20px",
                            height: "2px",
                            background: "#fff",
                            borderRadius: "2px",
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                    flex: "0 0 auto",
                    minWidth: "220px",
                    marginLeft: "auto",
                    padding: 0,
                    borderRadius: 0,
                    boxShadow: "none",
                    background: "transparent",
                    marginRight: "-20px",
                  }}
                >
                  {renderHeaderAlertButtons()}

                  <div style={{ position: "relative" }} ref={profileMenuRef}>
                    {renderProfileTrigger("full")}
                    {profileMenuDropdown}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {isMobile && renderMobileNavRail()}

        <main
          style={{
            flex: 1,
            padding: isMobile ? "20px 20px 60px" : "48px 35px 80px",
          }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>{renderedChildren}</div>
        </main>
      </div>
    </div>
  );
}
