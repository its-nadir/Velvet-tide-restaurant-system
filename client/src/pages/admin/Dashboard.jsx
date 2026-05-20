import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminTheme,
  buttonStyle,
  createCardStyle,
  createChipStyle,
  mutedParagraphStyle,
  sectionHeadingStyle,
  underlineStyle,
} from "./adminTheme";
import { API_BASE_URL } from "../../config/api";
const reservationIconUrl = new URL("/Icons/reservation-black.png", import.meta.url).href;
const managementIconUrl = new URL("/Icons/management-black.png", import.meta.url).href;
const messagesIconUrl = new URL("/Icons/messages-balck.png", import.meta.url).href;

const AddReservationIcon = ({ color = "#4f46e5" }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="8.5" />
    <line x1="12" y1="9.5" x2="12" y2="14.5" />
    <line x1="9.5" y1="12" x2="14.5" y2="12" />
  </svg>
);

const WEEKLY_HOURS = [
  { dayIndex: 0, label: "Sunday", closed: true },
  { dayIndex: 1, label: "Monday", open: "09:00", close: "21:00" },
  { dayIndex: 2, label: "Tuesday", open: "09:00", close: "21:00" },
  { dayIndex: 3, label: "Wednesday", open: "09:00", close: "21:00" },
  { dayIndex: 4, label: "Thursday", open: "09:00", close: "21:00" },
  { dayIndex: 5, label: "Friday", open: "09:00", close: "21:00" },
  { dayIndex: 6, label: "Saturday", open: "09:00", close: "21:00" },
];

const parseTimeToMinutes = (value = "") => {
  const [hours, minutes] = value.split(":").map((segment) => Number(segment));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const formatTimeDisplay = (value = "") => {
  const [hours, minutes] = value.split(":").map((segment) => Number(segment));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "-";
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

const formatDateTimeShort = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatFullDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0";
  return typeof value === "number" ? value.toLocaleString() : String(value);
};

const truncateText = (value, limit = 100) => {
  if (!value) return "-";
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
};

const formatPhoneNumber = (value = "") => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value || "-";
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleUnauthorized = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminProfile");
  window.location.href = "/admin";
};

const fetchWithAuth = async (url, options = {}) => {
  const headers = { ...(options.headers || {}), ...getAuthHeaders() };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }
  return response;
};

const InfoRow = ({ label, value, helper }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <div
      style={{
        fontSize: "0.75rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: adminTheme.palette.textMuted,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "1rem", fontWeight: 600, color: adminTheme.palette.contrast }}>
      {value}
    </div>
    {helper ? (
      <div style={{ ...mutedParagraphStyle, fontSize: "0.85rem", color: adminTheme.palette.textMuted }}>
        {helper}
      </div>
    ) : null}
  </div>
);

const statusVariantMap = {
  confirmed: "success",
  pending: "neutral",
  cancelled: "danger",
};

export default function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchDashboardData = useCallback(
    async ({ silent, signal, isManual = false } = {}) => {
      if (!silent) {
        setIsLoading(true);
      }
      if (isManual) {
        setIsRefreshing(true);
      }
      setError("");
      try {
        const today = new Date();
        const todayIso = today.toISOString().split("T")[0];
        const reservationsPromise = fetchWithAuth(
          `${API_BASE_URL}/api/reservations?limit=300&from=${todayIso}`,
          { signal }
        );
        const messagesPromise = fetchWithAuth(`${API_BASE_URL}/api/messages`, { signal });
        const menuPromise = fetchWithAuth(`${API_BASE_URL}/api/menu`, { signal });

        const [reservationsResponse, messagesResponse, menuResponse] = await Promise.all([
          reservationsPromise,
          messagesPromise,
          menuPromise,
        ]);

        const reservationsPayload = await reservationsResponse.json().catch(() => ({}));
        const messagesPayload = await messagesResponse.json().catch(() => []);
        const menuPayload = await menuResponse.json().catch(() => []);

        const normalizedReservations = Array.isArray(reservationsPayload)
          ? reservationsPayload
          : Array.isArray(reservationsPayload?.data)
          ? reservationsPayload.data
          : [];

        if (!isMountedRef.current) return;

        setReservations(normalizedReservations);
        setMessages(Array.isArray(messagesPayload) ? messagesPayload : []);
        setMenuItems(Array.isArray(menuPayload) ? menuPayload : []);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        if (!isMountedRef.current) return;
        setError(err.message || "Unable to load dashboard data.");
      } finally {
        if (!isMountedRef.current) return;
        if (!silent) {
          setIsLoading(false);
        }
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData({ signal: controller.signal });
    return () => {
      controller.abort();
    };
  }, [fetchDashboardData]);

  const derivedMetrics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const todays = [];
    const upcoming = [];
    let todayConfirmed = 0;
    let todaysPending = 0;
    let todayGuests = 0;

    reservations.forEach((reservation) => {
      const reservationDate = new Date(reservation.reservation_date);
      if (Number.isNaN(reservationDate.getTime())) return;
      if (reservationDate >= startOfToday && reservationDate < startOfTomorrow) {
        todays.push(reservation);
        todayGuests += reservation.number_of_persons || 0;
        const normalized = (reservation.status || "").toLowerCase();
        if (normalized === "confirmed") {
          todayConfirmed += 1;
        } else if (normalized === "pending") {
          todaysPending += 1;
        }
      } else if (reservationDate >= startOfTomorrow) {
        upcoming.push(reservation);
      }
    });

    const sortByTime = (list) =>
      [...list].sort((a, b) => {
        const dateDiff =
          new Date(a.reservation_date).getTime() - new Date(b.reservation_date).getTime();
        if (dateDiff !== 0) return dateDiff;
        const timeA = parseTimeToMinutes(a.reservation_time) ?? 0;
        const timeB = parseTimeToMinutes(b.reservation_time) ?? 0;
        return timeA - timeB;
      });

    const sortedToday = sortByTime(todays);
    const sortedUpcoming = sortByTime(upcoming);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nextToday = sortedToday.find(
      (reservation) => (parseTimeToMinutes(reservation.reservation_time) ?? 0) >= nowMinutes
    );
    const nextReservation = nextToday || sortedUpcoming[0] || null;

    return {
      todayCount: todays.length,
      todayConfirmed,
      todayPending: todaysPending,
      todayGuests,
      todaysReservations: sortedToday.slice(0, 6),
      upcomingCount: upcoming.length,
      nextReservation,
      newMessagesCount: messages.filter((message) => !message.is_read).length,
      availableDishes: menuItems.filter((item) => item.available !== false).length,
    };
  }, [reservations, messages, menuItems]);

  const statusInfo = useMemo(() => {
    const now = new Date();
    const dayIndex = now.getDay();
    const todayHours =
      WEEKLY_HOURS.find((slot) => slot.dayIndex === dayIndex) || WEEKLY_HOURS[0];
    const openMinutes = todayHours.closed ? null : parseTimeToMinutes(todayHours.open);
    const closeMinutes = todayHours.closed ? null : parseTimeToMinutes(todayHours.close);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const isOpen =
      typeof openMinutes === "number" &&
      typeof closeMinutes === "number" &&
      nowMinutes >= openMinutes &&
      nowMinutes < closeMinutes;

    const nextReservation = derivedMetrics.nextReservation;
    return {
      dayLabel: formatFullDate(now),
      hoursLabel: todayHours.closed ? "Closed today" : `${todayHours.open} - ${todayHours.close}`,
      statusLabel: todayHours.closed
        ? "Closed today"
        : isOpen
        ? "Open now"
        : `Closed - opens ${todayHours.open}`,
      isOpen,
      nextReservationLabel: nextReservation
        ? `${formatTimeDisplay(nextReservation.reservation_time)} - ${
            nextReservation.guest_name || "Guest"
          }`
        : "No upcoming reservations",
      nextReservationDate: nextReservation?.reservation_date || null,
    };
  }, [derivedMetrics.nextReservation]);

  const messagesPreview = useMemo(() => messages.slice(0, 4), [messages]);

  const kpiCards = useMemo(
    () => [
      {
        id: "today",
        label: "Today's Reservations",
        value: derivedMetrics.todayCount,
        detail: `${derivedMetrics.todayGuests} guests - ${derivedMetrics.todayConfirmed} confirmed`,
      },
      {
        id: "upcoming",
        label: "Upcoming Reservations",
        value: derivedMetrics.upcomingCount,
        detail: derivedMetrics.nextReservation
          ? `${formatTimeDisplay(derivedMetrics.nextReservation.reservation_time)} - ${formatFullDate(
              derivedMetrics.nextReservation.reservation_date
            )}`
          : "No upcoming bookings",
      },
      {
        id: "messages",
        label: "New Messages",
        value: derivedMetrics.newMessagesCount,
        detail: `${messages.length} total`,
      },
      {
        id: "dishes",
        label: "Available Dishes",
        value: derivedMetrics.availableDishes,
        detail: `${menuItems.length} in menu`,
      },
    ],
    [derivedMetrics, messages.length, menuItems.length]
  );

  const quickActions = [
    {
      id: "add",
      label: "Add Reservation",
      icon: { render: () => <AddReservationIcon color={adminTheme.palette.contrast} /> },
      path: "/admin/reservations",
    },
    {
      id: "view",
      label: "View Reservations",
      icon: { src: reservationIconUrl, alt: "View reservations" },
      path: "/admin/reservations",
    },
    {
      id: "menu",
      label: "Manage Menu",
      icon: { src: managementIconUrl, alt: "Manage menu" },
      path: "/admin/management",
    },
    {
      id: "messages",
      label: "View Messages",
      icon: { src: messagesIconUrl, alt: "View messages" },
      path: "/admin/messages",
    },
  ];

  const handleRefresh = () => {
    if (isRefreshing) return;
    fetchDashboardData({ silent: true, isManual: true });
  };

  const reservationsCard = (
    <div style={createCardStyle({ padding: "28px" })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: adminTheme.fonts.display, margin: 0 }}>Today&apos;s Reservations</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/reservations")}
          style={buttonStyle("ghost", {
            padding: "10px 18px",
            border: `1px solid ${adminTheme.palette.border}`,
            fontSize: "0.85rem",
          })}
        >
          View all
        </button>
      </div>

      <div style={{ marginTop: "20px", borderRadius: adminTheme.radii.lg, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 0.8fr 0.8fr 1.2fr 0.9fr",
           
            padding: "14px 20px",
            background: adminTheme.palette.surfaceMuted,
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: adminTheme.palette.contrast,
            marginLeft: "-5px"
          }}
        >
          <div>Time</div>
          <div>Guests</div>
          <div>Table</div>
          <div>Phone</div>
          <div>Status</div>
        </div>
        {isLoading && derivedMetrics.todaysReservations.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: adminTheme.palette.textMuted,
              fontFamily: adminTheme.fonts.body,
            }}
          >
            Loading today&apos;s reservations...
          </div>
        ) : derivedMetrics.todaysReservations.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: adminTheme.palette.textMuted,
              fontFamily: adminTheme.fonts.body,
            }}
          >
            No reservations scheduled for today.
          </div>
        ) : (
          derivedMetrics.todaysReservations.map((reservation, index) => {
            const statusKey = (reservation.status || "pending").toLowerCase();
            const chipVariant = statusVariantMap[statusKey] || "neutral";
            const tableMeta =
              reservation.table && typeof reservation.table === "object"
                ? reservation.table
                : null;
            const rawTableLabel =
              typeof tableMeta?.table_number === "number"
                ? tableMeta.table_number
                : reservation.table && typeof reservation.table === "string"
                ? reservation.table
                : null;
            const tableLabel = rawTableLabel
              ? String(rawTableLabel).match(/\d+/)?.[0] || String(rawTableLabel)
              : "Unassigned";
            return (
              <button
                key={reservation._id || reservation.id || index}
                type="button"
                onClick={() => navigate("/admin/reservations")}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 0.8fr 0.8fr 1.2fr 0.9fr",
                  gap: "8px",
                  padding: "16px 20px",
                  width: "100%",
                  border: "none",
                  borderBottom: `1px solid ${adminTheme.palette.border}`,
                  background: "#fff",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: adminTheme.fonts.body,
                  color: adminTheme.palette.contrast,
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ fontWeight: 600 }}>{formatTimeDisplay(reservation.reservation_time)}</div>
                <div>{reservation.number_of_persons || "-"}</div>
                <div>{tableLabel}</div>
                <div style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatPhoneNumber(reservation.phone_number)}
                </div>
                <div>
                  <span
                    style={createChipStyle(chipVariant, {
                      padding: "4px 10px",
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                    })}
                  >
                    {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const messagesCard = (
    <div style={createCardStyle({ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" })}>
      <div>
        <h2 style={{ fontFamily: adminTheme.fonts.display, margin: 0 }}>Messages Preview</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {messagesPreview.length === 0 ? (
          <div
            style={{
              padding: "20px",
              borderRadius: adminTheme.radii.lg,
              border: `1px dashed ${adminTheme.palette.border}`,
              textAlign: "center",
              color: adminTheme.palette.textMuted,
              fontFamily: adminTheme.fonts.body,
            }}
          >
            No new guest messages
          </div>
        ) : (
          messagesPreview.map((message, index) => {
            const timestamp = message.createdAt || message.created_at || message.updatedAt;
            return (
              <button
                key={message._id || index}
                type="button"
                onClick={() => navigate("/admin/messages")}
                style={{
                  width: "100%",
                  border: `1px solid ${adminTheme.palette.border}`,
                  borderRadius: adminTheme.radii.lg,
                  padding: "14px 16px",
                  background: message.is_read ? "#fff" : adminTheme.palette.surfaceMuted,
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ fontWeight: 600, color: adminTheme.palette.contrast }}>
                    {message.name || "Guest"}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: adminTheme.palette.textMuted }}>
                    {formatDateTimeShort(timestamp)}
                  </div>
                </div>
                <div style={{ fontSize: "0.9rem", color: adminTheme.palette.contrast }}>
                  {truncateText(message.message || message.subject || "", 110)}
                </div>
                {!message.is_read && (
                  <span
                    style={createChipStyle("accent", {
                      alignSelf: "flex-start",
                      padding: "4px 10px",
                      fontSize: "0.75rem",
                    })}
                  >
                    New
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
      <button
        type="button"
        onClick={() => navigate("/admin/messages")}
        style={buttonStyle("ghost", {
          width: "100%",
          border: `1px solid ${adminTheme.palette.border}`,
          padding: "12px 18px",
        })}
      >
        View all messages
      </button>
    </div>
  );

  const statusCard = (
    <div style={createCardStyle({ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" })}>
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <h2 style={{ fontFamily: adminTheme.fonts.display, margin: 0 }}>Restaurant Status</h2>
      </div>
      <InfoRow label="Today" value={statusInfo.dayLabel} />
      <InfoRow
        label="Restaurant status"
        value={
          <span
            style={createChipStyle(statusInfo.isOpen ? "success" : "danger", {
              padding: "8px 16px",
              letterSpacing: "0.05em",
            })}
          >
            {statusInfo.statusLabel}
          </span>
        }
      />
      <InfoRow label="Opening hours" value={statusInfo.hoursLabel} />
      <InfoRow
        label="Next reservation"
        value={statusInfo.nextReservationLabel}
        helper={statusInfo.nextReservationDate ? formatFullDate(statusInfo.nextReservationDate) : undefined}
      />
    </div>
    </div>
  );

  const quickActionsCard = (
    <div style={createCardStyle({ padding: "24px" })}>
      <div>
        <h2 style={{ fontFamily: adminTheme.fonts.display, margin: "0 0 6px" }}>Quick actions</h2>
      </div>
      <div
        style={{
          marginTop: "18px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.path)}
            style={{
              ...buttonStyle("ghost", {
                border: `1px solid ${adminTheme.palette.border}`,
                background: "#fff",
                flex: windowWidth <= 640 ? "1 1 100%" : "1 1 220px",
                justifyContent: "flex-start",
                padding: "14px 18px",
                gap: "12px",
              }),
            }}
          >
            {action.icon?.render ? (
              <span style={{ display: "inline-flex", width: 24, height: 24 }}>
                {action.icon.render()}
              </span>
            ) : (
              <img src={action.icon.src} alt={action.icon.alt} style={{ width: 22, height: 22 }} />
            )}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );

  const kpiGridTemplate =
    windowWidth <= 520 ? "1fr" : windowWidth <= 960 ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))";
  const isKpiCompact = windowWidth <= 640;
  const mainGridTemplate =
    windowWidth <= 1080 ? "1fr" : "minmax(0, 1.8fr) minmax(0, 1fr)";
  const isCompactRefreshButton = windowWidth <= 640;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "18px",
        }}
      >
        <div style={{ flex: "1 1 360px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <h1 style={{ ...sectionHeadingStyle, marginBottom: 0 }}>Service Dashboard</h1>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label={isRefreshing ? "Refreshing data..." : "Refresh dashboard"}
              title={isRefreshing ? "Refreshing..." : "Refresh"}
              style={
                isCompactRefreshButton
                  ? {
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: "1px solid rgba(0,0,0,0.12)",
                      backgroundColor: "#000",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      cursor: isRefreshing ? "not-allowed" : "pointer",
                      opacity: isRefreshing ? 0.6 : 1,
                      transition: "opacity 0.2s ease",
                    }
                  : {
                      border: "none",
                      borderRadius: "999px",
                      backgroundColor: "#000",
                      padding: "14px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      cursor: isRefreshing ? "not-allowed" : "pointer",
                      color: "#fff",
                      fontFamily: adminTheme.fonts.body,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      fontSize: "0.9rem",
                      opacity: isRefreshing ? 0.8 : 1,
                      transition: "opacity 0.2s ease",
                    }
              }
            >
              <img
                src="/Icons/refresh.png"
                alt=""
                style={{ width: 18, height: 18, opacity: 0.9 }}
              />
              {!isCompactRefreshButton && (isRefreshing ? "Refreshing..." : "Refresh")}
            </button>
          </div>
          <div style={underlineStyle} />
     
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: adminTheme.radii.lg,
            background: "#fff4f0",
            color: adminTheme.palette.danger,
            border: `1px solid ${adminTheme.palette.border}`,
            fontFamily: adminTheme.fonts.body,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: kpiGridTemplate,
          gap: "16px",
        }}
      >
        {kpiCards.map((card) => (
          <div
            key={card.id}
            style={{
              borderRadius: "26px",
              padding: "18px 22px",
              background: "#fff",
              border: `1px solid ${adminTheme.palette.border}`,
              display: "flex",
              flexDirection: isKpiCompact ? "row" : "column",
              alignItems: isKpiCompact ? "center" : "flex-start",
              justifyContent: isKpiCompact ? "space-between" : "flex-start",
              gap: isKpiCompact ? "12px" : "6px",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: adminTheme.palette.textMuted,
                flex: isKpiCompact ? "1" : "initial",
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontSize: "1.6rem",
                fontFamily: adminTheme.fonts.display,
                marginLeft: isKpiCompact ? "auto" : 0,
                textAlign: isKpiCompact ? "right" : "left",
                minWidth: isKpiCompact ? "auto" : "100%",
              }}
            >
              {formatNumber(card.value)}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: mainGridTemplate,
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {reservationsCard}
          {messagesCard}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {statusCard}
          {quickActionsCard}
        </div>
      </div>
    </div>
  );
}
