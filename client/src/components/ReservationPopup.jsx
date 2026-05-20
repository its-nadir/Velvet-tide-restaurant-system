import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

const initialReservationState = {
  guest_name: "",
  phone_number: "",
  reservation_date: "",
  reservation_time: "19:00",
  number_of_persons: "1",
  notes: "",
  created_by: "",
  table_selection: "",
};

const ReservationPopup = ({
  isOpen,
  onClose,
  hideImageSection = false,
  hideBookingMessage = false,
  guestNamePlaceholder = "YOUR NAME",
  notesLabel = "Message",
  showTableSelection = false,
  tableSelectionLabel = "Table Assignment",
  successMessageText = "Thank you! Your reservation has been saved. Expect a confirmation call shortly.",
  defaultStatus = "pending",
}) => {
  const [reservationData, setReservationData] = useState(initialReservationState);

  const [sundayError, setSundayError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [availableTables, setAvailableTables] = useState([]);
  const [isTableOptionsLoading, setIsTableOptionsLoading] = useState(false);
  const [tableOptionsError, setTableOptionsError] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      return;
    }
    setReservationData(initialReservationState);
    setAvailableTables([]);
    setTableOptionsError("");
    setSuccessMessage("");
    setSubmitError("");
    setSundayError(false);
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For phone field, only allow numbers
    if (name === "phone_number") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setReservationData({
        ...reservationData,
        [name]: numericValue,
      });
    } else if (name === "reservation_date") {
      // Check if the selected date is a Sunday
      const selectedDate = new Date(value);
      if (selectedDate.getDay() === 0) {
        setSundayError(true);
        setReservationData({
          ...reservationData,
          [name]: "",
        });
        return;
      }
      setSundayError(false);
      setReservationData({
        ...reservationData,
        [name]: value,
      });
    } else {
      setReservationData({
        ...reservationData,
        [name]: value,
      });
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSuccessMessage("");

    if (showTableSelection && !reservationData.table_selection) {
      setSubmitError("Please select an available table for this reservation.");
      return;
    }

    const payload = {
      guest_name: reservationData.guest_name.trim(),
      phone_number: reservationData.phone_number.trim(),
      number_of_persons: Number(reservationData.number_of_persons) || 1,
      reservation_date: reservationData.reservation_date,
      reservation_time: reservationData.reservation_time,
      notes: reservationData.notes.trim(),
      created_by: reservationData.created_by.trim(),
      table: reservationData.table_selection || null,
      status: (defaultStatus || "pending").toLowerCase(),
    };

    if (!payload.reservation_date) {
      setSundayError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit reservation");
      }

      setReservationData(initialReservationState);
      setSuccessMessage(successMessageText);
      window.dispatchEvent(new CustomEvent("reservation:created"));
    } catch (error) {
      setSubmitError(error.message || "Unable to submit reservation at this time.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!showTableSelection) {
      setAvailableTables([]);
      setTableOptionsError("");
      return;
    }

    if (
      !isOpen ||
      !reservationData.number_of_persons ||
      !reservationData.reservation_date ||
      !reservationData.reservation_time
    ) {
      setAvailableTables([]);
      setTableOptionsError("");
      setReservationData((prev) =>
        prev.table_selection
          ? {
              ...prev,
              table_selection: "",
            }
          : prev
      );
      return;
    }

    const controller = new AbortController();
    const loadTables = async () => {
      setIsTableOptionsLoading(true);
      setTableOptionsError("");
      try {
        const params = new URLSearchParams({
          guests: reservationData.number_of_persons,
          date: reservationData.reservation_date,
          time: reservationData.reservation_time,
        });
        const response = await fetch(
          `${API_BASE_URL}/api/tables/available?${params.toString()}`,
          { signal: controller.signal }
        );
        const payload = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(payload.message || "Unable to load table availability");
        }
        const normalizedTables = Array.isArray(payload) ? payload : [];
        setAvailableTables(normalizedTables);
        setReservationData((prev) => {
          if (normalizedTables.some((table) => table._id === prev.table_selection)) {
            return prev;
          }
          const fallbackSelection = normalizedTables[0]?._id || "";
          if (prev.table_selection === fallbackSelection) {
            return prev;
          }
          return {
            ...prev,
            table_selection: fallbackSelection,
          };
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        setTableOptionsError(error.message || "Unable to load table availability");
        setAvailableTables([]);
        setReservationData((prev) =>
          prev.table_selection
            ? {
                ...prev,
                table_selection: "",
              }
            : prev
        );
      } finally {
        setIsTableOptionsLoading(false);
      }
    };

    loadTables();
    return () => controller.abort();
  }, [
    showTableSelection,
    reservationData.number_of_persons,
    reservationData.reservation_date,
    reservationData.reservation_time,
    isOpen,
  ]);

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          /* Calendar styling */
          input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0;
            position: absolute;
            right: 0;
            width: 100%;
            height: 100%;
          }

          input[type="date"]::-webkit-datetime-edit {
            color: #666;
          }

          input[type="date"]::-webkit-datetime-edit-fields-wrapper {
            background: white;
          }

          /* Custom calendar styles */
          input[type="date"] {
            position: relative;
            color-scheme: light;
          }

          /* Style for disabled past dates and Sundays */
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(0.5);
          }

          /* Calendar popup background */
          input[type="date"]::-webkit-calendar-picker-indicator:hover {
            background: transparent;
          }
        `}
      </style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px",
          paddingTop: "50px",
          overflow: "auto",
        }}
        onClick={onClose}
      >
      <div
        style={{
          position: "relative",
          backgroundColor: "white",
          maxWidth: "1000px",
          width: "100%",
          display: "flex",
          flexDirection: hideImageSection ? "column" : windowWidth <= 768 ? "column" : "row",
          borderRadius: "0",
          overflow: "visible",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            fontSize: "2em",
            cursor: "pointer",
            color: "#999",
            zIndex: 10,
            lineHeight: "1",
            padding: "5px",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "300",
          }}
          onMouseOver={(e) => e.target.style.color = "#333"}
          onMouseOut={(e) => e.target.style.color = "#999"}
        >
          ×
        </button>

        {/* Left Side - Image with Offer */}
        {!hideImageSection && (
          <div
            style={{
              flex: windowWidth <= 768 ? "0 0 auto" : "0 0 33%",
              minHeight: windowWidth <= 768 ? "350px" : "480px",
              maxHeight: windowWidth <= 768 ? "350px" : "none",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              backgroundColor: "white",
              order: windowWidth <= 768 ? 1 : 0,
            }}
          >
            <img
              src="/Photos/img9.jpg"
              alt="Restaurant offer"
              style={{
                width: windowWidth <= 768 ? "50%" : "calc(100% - 50px)",
                height: "100%",
                objectFit: "contain",
                position: windowWidth <= 768 ? "relative" : "absolute",
                top: windowWidth <= 768 ? "auto" : 0,
                left: windowWidth <= 768 ? "auto" : "60px",
              }}
            />
          </div>
        )}

        {/* Right Side - Reservation Form */}
        <div
          style={{
            flex: "1",
            padding: windowWidth <= 768 ? "15px 50px 20px 50px" : "50px 50px 20px 50px",
            backgroundColor: "white",
            overflow: "visible",
            order: hideImageSection ? 0 : windowWidth <= 768 ? 2 : 1,
          }}
        >
          <h2
            style={{
              fontSize: windowWidth <= 768 ? "2em" : "2.2em",
              marginBottom: "15px",
              fontFamily: "montserrat",
              fontWeight: "400",
              color: "#000",
              textAlign: "center",
              marginTop: windowWidth <= 768 ? "0px" : "10px",

            }}
          >
            Online Reservation
          </h2>
          {!hideBookingMessage && (
            <p
              style={{
                fontSize: "0.85em",
                color: "#666",
                marginBottom: "35px",
                fontFamily: "'Montserrat', sans-serif",
                textAlign: "center",
                lineHeight: "1.6",
              }}
            >
              Booking request{" "}
              <strong style={{ color: "#ff6b35" }}>
                (456) 789-12301
              </strong>{" "}
              or fill out the order form
            </p>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name and Phone Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "1fr 1fr",
                gap: "20px",
                marginBottom: "10px",
                marginTop: "-20px",
              }}
            >
              {/* Name */}
              <div>
                <input
                  type="text"
                  name="guest_name"
                  value={reservationData.guest_name}
                  onChange={handleChange}
                  required
                  placeholder={guestNamePlaceholder}
                  style={{
                    width: "100%",
                    padding: "12px 0",
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

              {/* Phone */}
              <div>
                <input
                  type="tel"
                  name="phone_number"
                  value={reservationData.phone_number}
                  onChange={handleChange}
                  required
                  placeholder="PHONE NUMBER"
                  style={{
                    width: "100%",
                    padding: "12px 0",
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
            </div>

            {/* Date and Time Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "1fr 1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
                position: "relative",
                overflow: "visible",
              }}
            >
              {/* Guests */}
              <div style={{ position: "relative", overflow: "visible" }}>
                <svg
                  style={{
                    position: "absolute",
                    left: "0",
                    top: "10px",
                    width: "18px",
                    height: "18px",
                    pointerEvents: "none",
                  }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <select
                  name="number_of_persons"
                  value={reservationData.number_of_persons}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    paddingLeft: "28px",
                    border: "none",
                    borderBottom: "1px solid #ddd",
                    borderRadius: "0",
                    fontSize: "0.7em",
                    fontFamily: "'Montserrat', sans-serif",
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                    appearance: "none",
                    backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23999%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 5px center",
                    backgroundSize: "18px",
                    paddingRight: "30px",
                    outline: "none",
                    color: "#666",
                    position: "relative",
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} Person{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div style={{ position: "relative" }}>
                <svg
                  onClick={() => document.querySelector('input[name="reservation_date"]').showPicker()}
                  style={{
                    position: "absolute",
                    left: "0",
                    top: "10px",
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                    zIndex: 1,
                  }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input
                  type="date"
                  name="reservation_date"
                  value={reservationData.reservation_date}
                  onChange={handleChange}
                  min={getTodayDate()}
                  required
                  placeholder="DD/MM/YYYY"
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    paddingLeft: "28px",
                    border: "none",
                    borderBottom: "1px solid #ddd",
                    borderRadius: "0",
                    fontSize: "0.7em",
                    fontFamily: "'Montserrat', sans-serif",
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                    outline: "none",
                    color: "#666",
                    colorScheme: "light",
                  }}
                />
                {sundayError && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "8px",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ff6b35"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        width: "14px",
                        height: "14px",
                        flexShrink: 0,
                      }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <p
                      style={{
                        color: "#ff6b35",
                        fontSize: "0.65em",
                        margin: "0",
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: "400",
                        lineHeight: "1.4",
                      }}
                    >
                      We're closed on Sundays. Please choose another day.
                    </p>
                  </div>
                )}
              </div>

              {/* Time */}
              <div style={{ position: "relative" }}>
                <svg
                  style={{
                    position: "absolute",
                    left: "0",
                    top: "10px",
                    width: "18px",
                    height: "18px",
                    pointerEvents: "none",
                  }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <select
                  name="reservation_time"
                  value={reservationData.reservation_time}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    paddingLeft: "28px",
                    border: "none",
                    borderBottom: "1px solid #ddd",
                    borderRadius: "0",
                    fontSize: "0.7em",
                    fontFamily: "'Montserrat', sans-serif",
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                    appearance: "none",
                    backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23999%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 5px center",
                    backgroundSize: "18px",
                    paddingRight: "30px",
                    outline: "none",
                    color: "#666",
                    position: "relative",
                  }}
                >
                  <option value="09:00">9:00 AM</option>
                  <option value="09:30">9:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="12:30">12:30 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="13:30">1:30 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="15:30">3:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="16:30">4:30 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="17:30">5:30 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="18:30">6:30 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="19:30">7:30 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="20:30">8:30 PM</option>
                  <option value="21:00">9:00 PM</option>
                </select>
              </div>
            </div>

            {showTableSelection && (
              <div style={{ marginBottom: "35px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.6em",
                    color: "#666",
                    marginBottom: "10px",
                    fontFamily: "'Montserrat', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {tableSelectionLabel}
                </label>
                <select
                  name="table_selection"
                  value={reservationData.table_selection}
                  onChange={handleChange}
                  required
                  disabled={!availableTables.length || isTableOptionsLoading}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    border: "none",
                    borderBottom: "1px solid #ddd",
                    borderRadius: "0",
                    fontSize: "0.7em",
                    fontFamily: "'Montserrat', sans-serif",
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                    appearance: "none",
                    backgroundImage:
                      "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23999%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 5px center",
                    backgroundSize: "18px",
                    paddingRight: "30px",
                    outline: "none",
                    color: "#666",
                  }}
                >
                  {availableTables.length > 0 ? (
                    availableTables.map((table) => (
                      <option key={table._id} value={table._id}>
                        {`Table ${table.table_number} • ${table.number_of_chairs} seats${
                          table.position ? ` – ${table.position}` : ""
                        }`}
                      </option>
                    ))
                  ) : (
                    <option value="">
                      {isTableOptionsLoading
                        ? "Checking available tables..."
                        : reservationData.reservation_date && reservationData.reservation_time
                        ? "No tables available for the selected slot"
                        : "Select guests, date & time"}
                    </option>
                  )}
                </select>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "0.65em",
                    color: tableOptionsError ? "#c7523f" : "#777",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {tableOptionsError && tableOptionsError}
                  {!tableOptionsError && isTableOptionsLoading && "Checking which tables are free..."}
                  {!tableOptionsError &&
                    !isTableOptionsLoading &&
                    !availableTables.length &&
                    reservationData.reservation_date &&
                    reservationData.reservation_time &&
                    "No tables match the current selection. Try another time or reduce party size."}
                  {!tableOptionsError &&
                    !isTableOptionsLoading &&
                    !reservationData.reservation_date &&
                    "Select a date and time to load table availability."}
                </div>
              </div>
            )}

            {/* Message */}
            <div style={{ marginBottom: "35px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.6em",
                  color: "#666",
                  marginBottom: "10px",
                  fontFamily: "'Montserrat', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {notesLabel}
              </label>
              <textarea
                name="notes"
                value={reservationData.notes}
                onChange={handleChange}
                rows="1"
                style={{
                  width: "100%",
                  padding: "10px 0",
                  border: "none",
                  borderBottom: "1px solid #ddd",
                  borderRadius: "0",
                  fontSize: "0.9em",
                  fontFamily: "'Montserrat', sans-serif",
                  resize: "none",
                  boxSizing: "border-box",
                  backgroundColor: "transparent",
                  outline: "none",
                  color: "#666",
                  minHeight: "30px",
                  maxHeight: "30px",
                  overflow: "hidden",
                }}
              />
            </div>

            {/* Submit Button */}
            {(submitError || successMessage) && (
              <p
                style={{
                  color: submitError ? "#c7523f" : "#2f8c45",
                  fontSize: "0.75em",
                  marginBottom: "12px",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {submitError || successMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "18px",
                backgroundColor: isSubmitting ? "#f3a782" : "#ff6b35",
                color: "white",
                border: "none",
                fontSize: "0.8em",
                fontWeight: "600",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontFamily: "'Montserrat', sans-serif",
                transition: "background-color 0.3s ease",
                opacity: isSubmitting ? 0.8 : 1,
              }}
              onMouseOver={(e) => !isSubmitting && (e.target.style.backgroundColor = "#e55a2b")}
              onMouseOut={(e) => !isSubmitting && (e.target.style.backgroundColor = "#ff6b35")}
            >
              {isSubmitting ? "Saving..." : "Book a table"}
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default ReservationPopup;
