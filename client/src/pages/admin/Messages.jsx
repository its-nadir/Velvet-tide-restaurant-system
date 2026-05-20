import React, { useEffect, useRef, useState } from "react";
import {
  adminTheme,
  createCardStyle,
  createChipStyle,
  sectionHeadingStyle,
  underlineStyle,
  buttonStyle,
} from "./adminTheme";
import { API_BASE_URL } from "../../config/api";
const MESSAGES_CACHE_KEY = "adminMessagesCache";

const readMessagesCache = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MESSAGES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeMessagesCache = (messages) => {
  if (typeof window === "undefined") return null;
  try {
    const payload = { messages, timestamp: Date.now() };
    localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
};

const clearMessagesCache = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(MESSAGES_CACHE_KEY);
  } catch {
    // ignore
  }
};
const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

export default function Messages() {
  const cacheRef = useRef(null);
  if (cacheRef.current === null) {
    cacheRef.current = readMessagesCache();
  }

  const fetchControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const detailSectionRef = useRef(null);
  const [messages, setMessagesState] = useState(cacheRef.current?.messages || []);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(cacheRef.current === null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [messagePendingDeletion, setMessagePendingDeletion] = useState(null);
  const [isConfirmBulkDeleteOpen, setIsConfirmBulkDeleteOpen] = useState(false);
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const notifyMessagesUpdated = () =>
    window.dispatchEvent(new Event("messages:updated"));

  const persistMessagesToCache = (list) => {
    if (!Array.isArray(list)) return;
    if (list.length === 0) {
      clearMessagesCache();
      cacheRef.current = null;
      return;
    }
    const payload = writeMessagesCache(list);
    cacheRef.current = payload || { messages: list, timestamp: Date.now() };
  };

  const setMessages = (updater) => {
    setMessagesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!Array.isArray(next)) {
        return prev;
      }
      persistMessagesToCache(next);
      return next;
    });
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, []);

  const fetchMessages = async ({ isSoftRefresh = false } = {}) => {
    const shouldShowFullLoader = !isSoftRefresh && messages.length === 0;
    if (isSoftRefresh) {
      setIsRefreshing(true);
    } else if (shouldShowFullLoader) {
      setIsLoading(true);
    }
    setError("");

    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    let shouldSkipStateUpdate = false;
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/messages`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error("Unable to load guest messages.");
      }
      const payload = await response.json();
      const normalized = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data)
        ? payload.data
        : [];

      if (requestIdRef.current !== requestId) {
        return;
      }

      setMessages(normalized);
      setSelectedMessage((prev) => {
        if (!prev) return null;
        const next = normalized.find((msg) => msg._id === prev._id);
        return next || null;
      });
      notifyMessagesUpdated();
    } catch (err) {
      if (err.name === "AbortError" || requestIdRef.current !== requestId) {
        shouldSkipStateUpdate = true;
        return;
      }
      setError(err.message || "Unable to load guest messages.");
    } finally {
      if (fetchControllerRef.current === controller) {
        fetchControllerRef.current = null;
      }
      if (!shouldSkipStateUpdate && requestIdRef.current === requestId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!selectedMessage || selectedMessage.is_read) return;
    const markSelectedRead = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/messages/${selectedMessage._id}/read`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_read: true }),
        });
        if (response.ok) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === selectedMessage._id ? { ...msg, is_read: true } : msg
            )
          );
          notifyMessagesUpdated();
        }
      } catch {
        // ignore
      }
    };
    markSelectedRead();
  }, [selectedMessage]);

  const handleReply = (message) => {
    if (!message || !message.email) return;
    const subject = encodeURIComponent(`Re: ${message.subject || "Your message"}`);
    const body = encodeURIComponent(`Hi ${message.name || ""},\n\n`);
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        message.email
      )}&su=${subject}&body=${body}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleDeleteMessage = async (message) => {
    if (!message?._id) return;
    setMessagePendingDeletion(message);
  };

  const confirmDeleteMessage = async () => {
    if (!messagePendingDeletion?._id || isDeleting) return;
    const target = messagePendingDeletion;
    const previousMessages = messages;
    const previousSelected = selectedMessage;
    setIsDeleting(true);
    setMessagePendingDeletion(null);

    const nextMessages = previousMessages.filter((m) => m._id !== target._id);
    setMessages(nextMessages);
    if (previousSelected?._id === target._id) {
      setSelectedMessage(null);
    }
    notifyMessagesUpdated();

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/messages/${target._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to delete message at this time.");
      }
    } catch (error) {
      setMessages(previousMessages);
      setSelectedMessage(previousSelected);
      notifyMessagesUpdated();
      alert(error.message || "Unable to delete message.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteMessage = () => {
    setMessagePendingDeletion(null);
  };

  const handleDeleteAllMessages = () => {
    if (!messages.length || isBulkDeleting) return;
    setIsConfirmBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (!messages.length || isBulkDeleting) return;
    const previousMessages = messages;
    const previousSelected = selectedMessage;
    setIsBulkDeleting(true);
    setIsConfirmBulkDeleteOpen(false);
    setMessages([]);
    setSelectedMessage(null);
    notifyMessagesUpdated();
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/messages`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to delete messages at this time.");
      }
    } catch (error) {
      setMessages(previousMessages);
      setSelectedMessage(previousSelected);
      notifyMessagesUpdated();
      alert(error.message || "Unable to delete messages.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const cancelBulkDelete = () => {
    if (isBulkDeleting) return;
    setIsConfirmBulkDeleteOpen(false);
  };

  const markMessageAsRead = async (message) => {
    if (!message?._id || message.is_read) return;
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/messages/${message._id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
      if (!response.ok) return;
      setMessages((prev) =>
        prev.map((msg) => (msg._id === message._id ? { ...msg, is_read: true } : msg))
      );
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!selectedMessage) return;
    markMessageAsRead(selectedMessage);
  }, [selectedMessage]);

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    markMessageAsRead(message);
    if (windowWidth <= 768 && detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const layoutColumns =
    windowWidth <= 960 ? "1fr" : "minmax(320px, 0.35fr) minmax(0, 1fr)";
  const isCompactRefreshButton = windowWidth <= 640;

  return (
    <div style={{ color: adminTheme.palette.contrast }}>
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <h1 style={sectionHeadingStyle}>Guest Messages</h1>
            <div style={underlineStyle} />
          </div>
          <button
            type="button"
            onClick={() => fetchMessages({ isSoftRefresh: true })}
            disabled={isRefreshing}
            aria-label={isRefreshing ? "Refreshing messages..." : "Refresh messages"}
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
            <img src="/Icons/refresh.png" alt="" style={{ width: 18, height: 18 }} />
            {!isCompactRefreshButton && (isRefreshing ? "Refreshing..." : "Refresh")}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            ...createCardStyle({
              padding: "14px 18px",
              color: adminTheme.palette.danger,
              marginBottom: "20px",
            }),
          }}
        >
          {error}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: layoutColumns,
          gap: "24px",
        }}
      >
        <div
          style={createCardStyle({
            padding: "0",
            display: "flex",
            flexDirection: "column",
            minHeight: "480px",
          })}
        >
          <div
            style={{
              padding: "24px 28px",
              borderBottom: `1px solid ${adminTheme.palette.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: adminTheme.fonts.body,
                  fontSize: "0.78rem",
                  letterSpacing: "0.2em",
                  color: adminTheme.palette.textMuted,
                }}
              >
                Inbox
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                {messages.length} message{messages.length === 1 ? "" : "s"}
              </div>
            </div>
            <button
              type="button"
              onClick={handleDeleteAllMessages}
              disabled={isBulkDeleting || !messages.length}
              style={buttonStyle("ghost", {
                padding: "10px 18px",
                fontSize: "0.85rem",
              })}
            >
              {isBulkDeleting ? "Deleting…" : "Delete All"}
            </button>
          </div>
          <div style={{ flex: 1, width: "100%" }}>
            {isLoading ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: adminTheme.palette.textMuted,
                }}
              >
                Loading messages…
              </div>
            ) : messages.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: adminTheme.palette.textMuted,
                }}
              >
                No messages yet
              </div>
            ) : (
              messages.map((message) => {
                const isSelected = selectedMessage?._id === message._id;
                const isUnread = !message.is_read;
                return (
                  <div
                    key={message._id}
                    style={{
                      width: "100%",
                      borderBottom: `1px solid ${adminTheme.palette.border}`,
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        padding: "18px 26px",
                        paddingRight: "80px",
                        borderRadius: 0,
                        background: isSelected
                          ? "#fff"
                          : isUnread
                          ? adminTheme.palette.highlight
                          : "transparent",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectMessage(message)}
                        style={{
                          border: "none",
                          background: "transparent",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "6px",
                          padding: 0,
                          cursor: "pointer",
                          width: "100%",
                          maxWidth: "calc(100% - 60px)",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: adminTheme.palette.contrast,
                          }}
                        >
                          {message.name || "Guest"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: adminTheme.palette.textMuted,
                          }}
                        >
                          {message.subject || "General inquiry"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.74rem",
                            color: adminTheme.palette.textMuted,
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 10px",
                            borderRadius: adminTheme.radii.pill,
                            backgroundColor: isUnread
                              ? "rgba(255, 107, 53, 0.15)"
                              : "transparent",
                            marginLeft: "-10px",
                          }}
                        >
                          {formatDateTime(message.createdAt)}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(message)}
                        disabled={isDeleting}
                        style={{
                          border: `1px solid ${adminTheme.palette.border}`,
                          background: "transparent",
                          cursor: isDeleting ? "not-allowed" : "pointer",
                          padding: "4px",
                          borderRadius: "50%",
                          width: "34px",
                          height: "34px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          position: "absolute",
                          top: "50%",
                          right: "26px",
                          transform: "translateY(-50%)",
                        }}
                        aria-label="Delete message"
                      >
                        <img src="/Icons/trash.png" alt="" style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div ref={detailSectionRef} style={createCardStyle({ minHeight: "480px" })}>
          {!selectedMessage ? (
            <div
              style={{
                textAlign: "center",
                color: adminTheme.palette.textMuted,
                marginTop: "80px",
              }}
            >
              Select a message to view
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: adminTheme.fonts.display,
                      fontSize: "1.6rem",
                    }}
                  >
                    {selectedMessage.subject || "Message"}
                  </h2>
                  <div
                    style={createChipStyle("neutral", {
                      textTransform: "none",
                    })}
                  >
                    {formatDateTime(selectedMessage.createdAt)}
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: adminTheme.fonts.body,
                    color: adminTheme.palette.textMuted,
                    margin: "6px 0 0",
                  }}
                >
                  from {selectedMessage.name || "Guest"} (
                  {selectedMessage.email || "No email provided"})
                </p>
              </div>

              <div style={{ marginBottom: "24px" }} />

              <div
                style={{
                  border: `1px solid ${adminTheme.palette.border}`,
                  borderRadius: adminTheme.radii.lg,
                  padding: "18px",
                  background: "#fff",
                  marginBottom: "24px",
                  minHeight: "150px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: adminTheme.palette.textMuted,
                    marginBottom: "8px",
                    fontWeight: 600,
                  }}
                >
                  Message
                </div>
                <div style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                  {selectedMessage.message}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => handleReply(selectedMessage)}
                  style={buttonStyle("primary")}
                >
                  Reply via Email
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(selectedMessage)}
                  disabled={isDeleting}
                  style={{
                    ...buttonStyle("ghost", {
                      padding: "10px 22px",
                      gap: "8px",
                      color: adminTheme.palette.contrast,
                      fontWeight: 500,
                    }),
                    display: "inline-flex",
                    alignItems: "center",
                    border: `1px solid ${adminTheme.palette.border}`,
                    background: "#fff",
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                  aria-label="Delete message"
                >
                  <img src="/Icons/trash.png" alt="" style={{ width: 16, height: 16 }} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {messagePendingDeletion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: adminTheme.radii.lg,
              padding: "32px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              fontFamily: adminTheme.fonts.body,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "14px", fontFamily: adminTheme.fonts.display }}>
              Delete Message
            </h3>
            <p style={{ color: adminTheme.palette.textMuted }}>
              Remove this message from <strong>{messagePendingDeletion?.name || "Guest"}</strong> ?
             
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "18px" }}>
              <button
                type="button"
                onClick={cancelDeleteMessage}
                style={buttonStyle("ghost", { padding: "12px 24px" })}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMessage}
                disabled={isDeleting}
                style={buttonStyle("primary", {
                  background: adminTheme.palette.danger,
                  padding: "12px 24px",
                })}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isConfirmBulkDeleteOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: adminTheme.radii.lg,
              padding: "32px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              fontFamily: adminTheme.fonts.body,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "14px", fontFamily: adminTheme.fonts.display }}>
              Delete All Messages
            </h3>
            <p style={{ color: adminTheme.palette.textMuted }}>
              This will delete all messages 
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "18px" }}>
              <button
                type="button"
                onClick={cancelBulkDelete}
                disabled={isBulkDeleting}
                style={buttonStyle("ghost", { padding: "12px 24px" })}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBulkDelete}
                disabled={isBulkDeleting}
                style={buttonStyle("primary", {
                  background: adminTheme.palette.danger,
                  padding: "12px 24px",
                })}
              >
                {isBulkDeleting ? "Deleting…" : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
