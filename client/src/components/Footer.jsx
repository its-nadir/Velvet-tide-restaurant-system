import React, { useState, useEffect } from "react";

export default function Footer() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer
      style={{
        backgroundColor: "#000",
        color: "white",
        padding: "30px 40px 30px",
        marginTop: "0",
      }}
    >
      {/* Top Section: Logo and Social Icons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto 30px",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        {/* Logo */}
        <div>
          <img
            src="/Photos/logo.svg"
            alt="Velvet Tide Restaurant"
            style={{
              height: "70px",
              width: "auto",
              objectFit: "contain",
            }}
          />
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "#fff",
              marginTop: "15px",
              marginLeft: "25x",
            }}
          ></div>
        </div>

        {/* Social Media Icons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginTop: windowWidth <= 768 ? "20px" : "0",
            marginLeft: windowWidth <= 768 ? "20px" : "0",
          }}
        >
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#ff6b35",
              color: "#fff",
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2em",
              transition: "transform 0.3s, background-color 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.backgroundColor = "#e65f2e";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "#ff6b35";
            }}
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a
            href="https://pinterest.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#ff6b35",
              color: "#fff",
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2em",
              transition: "transform 0.3s, background-color 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.backgroundColor = "#e65f2e";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "#ff6b35";
            }}
          >
            <i className="fab fa-pinterest-p"></i>
          </a>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#ff6b35",
              color: "#fff",
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2em",
              transition: "transform 0.3s, background-color 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.backgroundColor = "#e65f2e";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "#ff6b35";
            }}
          >
            <i className="fab fa-whatsapp"></i>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#ff6b35",
              color: "#fff",
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2em",
              transition: "transform 0.3s, background-color 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.backgroundColor = "#e65f2e";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "#ff6b35";
            }}
          >
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>

      {/* Three Column Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: windowWidth <= 768 ? "20px" : "40px",
          maxWidth: "1200px",
          margin: "0 auto 40px",
          textAlign: "left",
          paddingLeft: "20px",
        }}
      >
        {/* Contact Info Column */}
        <div>
          <h3
            style={{
              color: "#fff",
              fontSize: windowWidth <= 768 ? "1.1em" : "1.3em",
              fontFamily: "helvetica",
              fontWeight: "600",
            }}
          >
            Contact Info
          </h3>
          <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "12px" }}>
            <i className="fas fa-phone" style={{ color: "#fff", fontSize: windowWidth <= 768 ? "0.9em" : "1.1em" }}></i>
            <p
              style={{
                color: "#ccc",
                fontSize: windowWidth <= 768 ? "0.8em" : "0.9em",
                lineHeight: "1.8",
                fontFamily: "'Lato', sans-serif",
                margin: 0,
              }}
            >
              (456) 789-12301
            </p>
          </div>
          <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "12px" }}>
            <i className="fas fa-envelope" style={{ color: "#fff", fontSize: windowWidth <= 768 ? "0.9em" : "1.1em" }}></i>
            <p
              style={{
                color: "#ccc",
                fontSize: windowWidth <= 768 ? "0.8em" : "0.9em",
                lineHeight: "1.8",
                fontFamily: "'Lato', sans-serif",
                margin: 0,
              }}
            >
              info@velvettide.com
            </p>
          </div>
        </div>

        {/* Opening Hours Column */}
        <div>
          <h3
            style={{
              color: "#fff",
              fontSize: windowWidth <= 768 ? "1.1em" : "1.3em",
              fontFamily: "helvetica",
              fontWeight: "600",
            }}
          >
            Opening Hours
          </h3>
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                color: "#ccc",
                fontSize: windowWidth <= 768 ? "0.8em" : "0.9em",
                fontFamily: "'Lato', sans-serif",
                lineHeight: "1.8",
                marginBottom: "8px",
              }}
            >
              Monday – Saturday <span style={{ color: "#fff", margin: "0 8px" }}>||</span> 09:00 AM — 9:00 PM
            </p>
            <p
              style={{
                color: "#ccc",
                fontSize: windowWidth <= 768 ? "0.8em" : "0.9em",
                fontFamily: "'Lato', sans-serif",
                lineHeight: "1.8",
              }}
            >
              Sunday <span style={{ color: "#fff", margin: "0 8px" }}>||</span> Closed
            </p>
          </div>
        </div>

        {/* Location Map Column */}
        <div>
          <div
            style={{
              width: "100%",
              height: "250px",
              overflow: "hidden",
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2937.8!2d-84.5555!3d42.7325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8822c5b0b0b0b0b0%3A0x0!2s1419%20E%20Michigan%20Ave%2C%20Lansing%2C%20MI%2048912!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(0%) invert(0%)" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Restaurant Location"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div
        style={{
          borderTop: "1px solid #333",
          paddingTop: "20px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.85em",
            color: "#888",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          © 2025 Velvet Tide Restaurant. All rights reserved
        </p>
      </div>
    </footer>
  );
}

