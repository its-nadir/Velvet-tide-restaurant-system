import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeAvatarForClient } from "../utils/avatarUtils";
import { API_BASE_URL } from "../config/api";
const ADMIN_PROFILE_EVENT = "adminProfile:updated";
const LAST_EMAIL_KEY = "adminLastEmail";

export default function AdminSignIn() {
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(LAST_EMAIL_KEY) || "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const updateEmail = (value) => {
    setEmail(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_EMAIL_KEY, value.trim());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError("Please enter both email and password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Unable to sign in. Please try again.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      const normalizedAdmin = data.admin
        ? {
            ...data.admin,
            avatar: normalizeAvatarForClient(data.admin.avatar),
          }
        : {};
      localStorage.setItem("adminProfile", JSON.stringify(normalizedAdmin));
      localStorage.setItem(LAST_EMAIL_KEY, normalizedEmail);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(ADMIN_PROFILE_EVENT, { detail: Object.keys(normalizedAdmin).length ? normalizedAdmin : null })
        );
      }
      navigate("/admin/dashboard");
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }
      setError("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f8f8",
        padding: windowWidth <= 768 ? "20px" : "0px",
        fontFamily: "'Playfair Display', Georgia, serif",
      }}
    >
      {/* Sign In Card */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "2px solid #000",
          borderRadius: "0",
          padding: windowWidth <= 768 ? "45px 18px" : "70px 30px",
          maxWidth: "480px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="/Photos/logo-light.svg"
            alt="Velvet Tide Restaurant"
            style={{
              height: windowWidth <= 768 ? "50px" : "70px",
              width: "auto",
              marginBottom: "15px",
            }}
          />
          <div
            style={{
              width: "80px",
              height: "3px",
              backgroundColor: "#ff6b35",
              margin: "0 auto 15px",
            }}
          />
        </div>


        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              color: "#c33",
              padding: "12px 15px",
              borderRadius: "6px",
              marginBottom: "20px",
              fontSize: "0.9em",
              fontFamily: "'Lato', sans-serif",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Email Field */}
          <div style={{ marginBottom: "20px", position: "relative", width: "80%", display: "flex", alignItems: "center" }}>
            {/* Email Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff6b35"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: "0",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => updateEmail(e.target.value)}
              placeholder="EMAIL ADDRESS"
              required
              autoComplete="off"
              style={{
                width: "100%",
                padding: "12px 0",
                paddingLeft: "30px",
                border: "none",
                borderBottom: "1px solid #ddd",
                borderRadius: "0",
                fontSize: "0.7em",
                fontFamily: "'Montserrat', sans-serif",
                boxSizing: "border-box",
                backgroundColor: "transparent",
                outline: "none",
                color: "#666",
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: "20px", position: "relative", width: "80%", display: "flex", alignItems: "center" }}>
            {/* Lock Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff6b35"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: "0",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD"
              required
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "12px 0",
                paddingLeft: "30px",
                paddingRight: "40px",
                border: "none",
                borderBottom: "1px solid #ddd",
                borderRadius: "0",
                fontSize: "0.7em",
                fontFamily: "'Montserrat', sans-serif",
                boxSizing: "border-box",
                backgroundColor: "transparent",
                outline: "none",
                color: "#666",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "0",
                top: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#999",
                fontSize: "1em",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#ff6b35")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#999")}
            >
              {showPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "18px", height: "18px" }}
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "18px", height: "18px" }}
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "40%",
              padding: "14px",
              backgroundColor: "#ff6b35",
              color: "white",
              border: "none",
              fontSize: "0.8em",
              fontWeight: "600",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'Montserrat', sans-serif",
              transition: "background-color 0.3s ease",
              borderRadius: "25px",
              marginTop: "10px",
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) e.target.style.backgroundColor = "#e55a2b";
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) e.target.style.backgroundColor = "#ff6b35";
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer Note */}
        <div
          style={{
            marginTop: "15px",
            paddingTop: "20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "40%",
              borderTop: "1px solid #eee",
              marginBottom: "20px",
            }}
          />
          <p
            style={{
              fontSize: "0.85em",
              color: "#999",
              fontFamily: "'Lato', sans-serif",
              margin: 0,
            }}
          >
            <i className="fas fa-lock" style={{ marginRight: "6px" }}></i>
            Secure admin access only
          </p>
        </div>
      </div>
    </div>
  );
}
