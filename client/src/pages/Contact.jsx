import React, { useState } from "react";
import { API_BASE_URL } from "../config/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || "Unable to send your message at this time.");
      }
      setSubmitSuccess("Thank you for reaching out. We'll get back to you shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitError(error.message || "Unable to send your message at this time.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Lato', sans-serif", background: "#fff" }}>
      {/* Hero Banner */}
      <section
        style={{
          position: "relative",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundImage: "url('/Photos/img4.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1,
          }}
        ></div>

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          {/* Title */}
          <h1
            style={{
              color: "#fff",
              fontSize: "3.5em",
              fontWeight: "600",
              textAlign: "center",
              margin: "0 0 15px 0",
              fontFamily: "dream avenue",
              letterSpacing: "3px",
            }}
          >
            Contact Us
          </h1>

          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              fontSize: "0.95em",
              color: "#ccc",
              fontFamily: "helvatica",
            }}
          >
            <a
              href="/"
              style={{
                color: "#ccc",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#fff")}
              onMouseLeave={(e) => (e.target.style.color = "#ccc")}
            >
              Home
            </a>
            <span style={{ color: "#888" }}>/</span>
            <span style={{ color: "#fff" }}>Contact</span>
          </div>
        </div>
      </section>

      {/* Get in touch with us Section */}
      <section
        style={{
          padding: "80px 20px 60px",
          margin: "0 auto",
          textAlign: "center",
          backgroundColor: "white",
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: "2em",
            fontStyle: "italic",
            color: "#000",
            marginBottom: "60px",
            fontFamily: "Georgia, serif",
            fontWeight: "400",

          }}
        >
          Get in touch with us !
        </h2>

        {/* Three Column Contact Info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(3, 1fr)",
            gap: "0",
            maxWidth: "900px",
            margin: "0 auto",
            marginTop: "-20px",
          }}
        >
          {/* Phone */}
          <div
            style={{
              padding: "40px 30px",
              borderRight: window.innerWidth <= 768 ? "none" : "1px solid #e0e0e0",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                style={{ margin: "0 auto" }}
              >
                <path
                  d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                  fill="#5ea34d"
                />
              </svg>
            </div>
            <h3
              style={{
                fontSize: "1.1em",
                color: "#1a1a1a",
                marginBottom: "15px",
                fontFamily: "'Lato', sans-serif",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              PHONE
            </h3>
           
            <p
              style={{
                fontSize: "0.9em",
                color: "#666",
                margin: "5px 0",
                fontFamily: "'Lato', sans-serif",
                lineHeight: "1.6",
              }}
            >
              (456) 789-12301
            </p>
          </div>

          {/* Address */}
          <div
            style={{
              padding: "40px 30px",
              borderRight: window.innerWidth <= 768 ? "none" : "1px solid #e0e0e0",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                style={{ margin: "0 auto" }}
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="#5ea34d"
                />
              </svg>
            </div>
            <h3
              style={{
                fontSize: "1.1em",
                color: "#1a1a1a",
                marginBottom: "15px",
                fontFamily: "'Lato', sans-serif",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              ADDRESS
            </h3>
            <p
              style={{
                fontSize: "0.9em",
                color: "#666",
                margin: "5px 0",
                fontFamily: "'Lato', sans-serif",
                lineHeight: "1.6",
              }}
            >
              1419 E. Michigan Avenue • Lansing, Michigan
            </p>
          
          </div>

          {/* Email */}
          <div
            style={{
              padding: "40px 30px",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                style={{ margin: "0 auto" }}
              >
                <path
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  fill="#5ea34d"
                />
              </svg>
            </div>
            <h3
              style={{
                fontSize: "1.1em",
                color: "#1a1a1a",
                marginBottom: "15px",
                fontFamily: "'Lato', sans-serif",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              EMAIL
            </h3>
            <p
              style={{
                fontSize: "0.9em",
                color: "#666",
                margin: "5px 0",
                fontFamily: "'Lato', sans-serif",
                lineHeight: "1.6",
              }}
            >
              info@velvettide.com
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        style={{
          padding: "60px 20px 80px",
          margin: "0 auto",
          textAlign: "center",
          backgroundColor: "#fff",
          marginTop: "-20px",
        }}
      >
        {/* Heading */}
        <h2
          style={{
            fontSize: "0.95em",
            color: "#1a1a1a",
            marginBottom: "10px",
            fontFamily: "monterserrat",
            fontWeight: "400",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          IF YOU GOT ANY QUESTIONS
        </h2>
        <p
          style={{
            fontSize: "0.95em",
            color: "#1a1a1a",
            marginBottom: "40px",
            fontFamily: "monterserrat",
            fontWeight: "400",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          PLEASE DO NOT HESITATE TO SEND US A MESSAGE.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Your Name */}
          <div style={{ maxWidth: "600px", margin: "20px auto" }}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: "0.9em",
                border: "1.5px solid #000",
                borderRadius: "0",
                boxSizing: "border-box",
                fontFamily: "'Lato', sans-serif",
                color: "#333",
                backgroundColor: "white",
                outline: "none",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#333")}
              onBlur={(e) => (e.target.style.borderColor = "#000")}
            />
          </div>

          {/* Your Email */}
          <div style={{ maxWidth: "600px", margin: "20px auto" }}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: "0.9em",
                border: "1.5px solid #000",
                borderRadius: "0",
                boxSizing: "border-box",
                fontFamily: "'Lato', sans-serif",
                color: "#333",
                backgroundColor: "white",
                outline: "none",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#333")}
              onBlur={(e) => (e.target.style.borderColor = "#000")}
            />
          </div>

          {/* Subject */}
          <div style={{ maxWidth: "600px", margin: "20px auto" }}>
            <input
              type="text"
              name="subject"
              value={formData.subject || ""}
              onChange={handleChange}
              placeholder="Subject"
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: "0.9em",
                border: "1.5px solid #000",
                borderRadius: "0",
                boxSizing: "border-box",
                fontFamily: "'Lato', sans-serif",
                color: "#333",
                backgroundColor: "white",
                outline: "none",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#333")}
              onBlur={(e) => (e.target.style.borderColor = "#000")}
            />
          </div>

          {/* Message */}
          <div style={{ maxWidth: "600px", margin: "20px auto 30px" }}>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message"
              required
              rows="6"
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: "0.9em",
                border: "1.5px solid #000",
                borderRadius: "0",
                boxSizing: "border-box",
                fontFamily: "'Lato', sans-serif",
                resize: "none",
                color: "#333",
                backgroundColor: "white",
                outline: "none",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#333")}
              onBlur={(e) => (e.target.style.borderColor = "#000")}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? "#555" : "#000",
              color: "white",
              padding: "15px 30px",
              fontSize: "0.8em",
              fontWeight: "600",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              textTransform: "uppercase",
              letterSpacing: "2px",
              transition: "background-color 0.3s ease",
              fontFamily: "'Lato', sans-serif",
              borderRadius: "25px",
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) e.target.style.backgroundColor = "#ff6b35";
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) e.target.style.backgroundColor = "#000";
            }}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
          {(submitError || submitSuccess) && (
            <div
              style={{
                marginTop: "18px",
                color: submitError ? "#c0392b" : "#2c7a31",
                fontSize: "0.9em",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {submitError || submitSuccess}
            </div>
          )}
        </form>
      </section>


    </div>
  );
};

export default Contact;
