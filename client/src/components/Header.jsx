import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header({ onReserveClick }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menusDropdownOpen, setMenusDropdownOpen] = useState(false);
  const [mobileMenusDropdownOpen, setMobileMenusDropdownOpen] = useState(false);

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }
            .hamburger-menu {
              display: block !important;
            }
            .desktop-social {
              display: none !important;
            }
            .site-header {
              padding: 14px 12px !important;
            }
            .site-logo {
              margin-left: 0 !important;
              height: 38px !important;
              display: block !important;
            }
          }
        `}
      </style>

      <header
        className="site-header"
        style={{
          backgroundColor: "black",
          color: "white",
          padding: "18px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo Section */}
        <div style={{ flex: "0 0 auto" }}>
          <Link to="/">
            <img
              className="site-logo"
              src="/Photos/logo.svg"
              alt="Velvet Tide Restaurant Logo"
              style={{ height: "45px", width: "auto", marginLeft: 0, display: "block" }}
            />
          </Link>
        </div>

        {/* Hamburger Menu Icon */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            fontSize: "1.5em",
            cursor: "pointer",
            padding: "10px",
          }}
          className="hamburger-menu"
        >
          <div style={{ width: "25px", height: "2px", backgroundColor: "white", margin: "5px 0" }}></div>
          <div style={{ width: "25px", height: "2px", backgroundColor: "white", margin: "5px 0" }}></div>
          <div style={{ width: "25px", height: "2px", backgroundColor: "white", margin: "5px 0" }}></div>
        </button>

        {/* Desktop Navigation */}
        <nav
          className="desktop-nav"
          style={{
            display: "flex",
            gap: "30px",
            alignItems: "center",
            flex: "1",
            justifyContent: "center",
          }}
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "0.9em",
              fontWeight: "700",
              letterSpacing: "1px",
              paddingBottom: "5px",
              borderBottom: location.pathname === "/" ? "2px solid #ff6b35" : "2px solid transparent",
              transition: "border-color 0.3s",
              textTransform: "uppercase",
            }}
            onMouseOver={(e) => (e.target.style.borderBottom = "2px solid white")}
            onMouseOut={(e) => (e.target.style.borderBottom = location.pathname === "/" ? "2px solid #ff6b35" : "2px solid transparent")}
          >
            Home
          </Link>
          <span style={{ color: "#666", fontSize: "1.2em" }}>|</span>

          <Link
            to="/about"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "0.9em",
              fontWeight: "700",
              letterSpacing: "1px",
              paddingBottom: "5px",
              borderBottom: location.pathname === "/about" ? "2px solid #ff6b35" : "2px solid transparent",
              transition: "border-color 0.3s",
              textTransform: "uppercase",
            }}
            onMouseOver={(e) => (e.target.style.borderBottom = "2px solid white")}
            onMouseOut={(e) => (e.target.style.borderBottom = location.pathname === "/about" ? "2px solid #ff6b35" : "2px solid transparent")}
          >
            Our Story
          </Link>
          <span style={{ color: "#666", fontSize: "1.2em" }}>|</span>

          {/* Menus Dropdown */}
          <div
            className="menus-dropdown-container"
            style={{ position: "relative", display: "flex", alignItems: "center", gap: "3px" }}
          >
            <Link
              to="/menu"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "0.9em",
                fontWeight: "700",
                letterSpacing: "1px",
                paddingBottom: "5px",
                borderBottom: location.pathname === "/menu" ? "2px solid #ff6b35" : "2px solid transparent",
                transition: "border-color 0.3s",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
              onClick={(e) => {
                e.preventDefault();
                setMenusDropdownOpen(!menusDropdownOpen);
              }}
              onMouseOver={(e) => (e.target.style.borderBottom = "2px solid white")}
              onMouseOut={(e) => (e.target.style.borderBottom = location.pathname === "/menu" ? "2px solid #ff6b35" : "2px solid transparent")}
            >
              Menu
            </Link>
            <img
              src="/Icons/dropdown-arrow.svg"
              alt="dropdown"
              onClick={(e) => {
                e.preventDefault();
                setMenusDropdownOpen(!menusDropdownOpen);
              }}
              style={{
                width: "12px",
                height: "12px",
                filter: "brightness(0) invert(1)",
                transform: menusDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
                cursor: "pointer",
                marginBottom: "3px",
                marginTop: "-3px",
              }}
            />

            {/* Dropdown Menu */}
            {menusDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  marginTop: "20px",
                  backgroundColor: "white",
                  minWidth: "220px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                  borderRadius: "0",
                  padding: "0",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "100%", height: "4px", backgroundColor: "#ff6b35" }}></div>
                {["Breakfast", "Lunch", "Dinner", "Drinks"].map((item) => (
                  <Link
                    key={item}
                    to={`/menu?category=${item.toLowerCase()}`}
                    onClick={() => setMenusDropdownOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "black",
                      textDecoration: "none",
                      fontSize: "0.95em",
                      fontWeight: "700",
                      padding: "18px 30px",
                      transition: "all 0.3s ease",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      borderBottom: item !== "Drinks" ? "1px solid #e0e0e0" : "none",
                      backgroundColor: "white",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#f8f8f8";
                      e.target.style.color = "#ff6b35";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "white";
                      e.target.style.color = "black";
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <span style={{ color: "#666", fontSize: "1.2em" }}>|</span>
          <Link
            to="/contact"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "0.9em",
              fontWeight: "700",
              letterSpacing: "1px",
              paddingBottom: "5px",
              borderBottom: location.pathname === "/contact" ? "2px solid #ff6b35" : "2px solid transparent",
              transition: "border-color 0.3s",
              textTransform: "uppercase",
            }}
            onMouseOver={(e) => (e.target.style.borderBottom = "2px solid white")}
            onMouseOut={(e) => (e.target.style.borderBottom = location.pathname === "/contact" ? "2px solid #ff6b35" : "2px solid transparent")}
          >
            Contact
          </Link>
        </nav>

        {/* Reserve Button */}
        <div className="desktop-social" style={{ flex: "0 0 auto" }}>
          <button
            onClick={onReserveClick}
            style={{
              backgroundColor: "#5ea34d",
              fontFamily: "'Sansita Swashed', sans-serif",
              color: "white",
              border: "none",
              padding: "15px 20px",
              fontSize: "0.85em",
              fontWeight: "600",
              letterSpacing: "1px",
              cursor: "pointer",
              borderRadius: "25px",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#4d6840";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#5ea34d";
              e.target.style.transform = "scale(1)";
            }}
          >
            Reserve a Table
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "81px",
            left: 0,
            right: 0,
            backgroundColor: "black",
            zIndex: 999,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            style={{
              color: location.pathname === "/" ? "#ff6b35" : "white",
              textDecoration: "none",
              fontSize: "1em",
              fontWeight: "700",
              letterSpacing: "1px",
              padding: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              borderLeft: location.pathname === "/" ? "3px solid #ff6b35" : "3px solid transparent",
            }}
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            style={{
              color: location.pathname === "/about" ? "#ff6b35" : "white",
              textDecoration: "none",
              fontSize: "1em",
              fontWeight: "700",
              letterSpacing: "1px",
              padding: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              borderLeft: location.pathname === "/about" ? "3px solid #ff6b35" : "3px solid transparent",
            }}
          >
            Our Story
          </Link>

          {/* Mobile Menu Dropdown */}
          <div
            onClick={() => setMobileMenusDropdownOpen(!mobileMenusDropdownOpen)}
            style={{
              color: location.pathname === "/menu" ? "#ff6b35" : "white",
              textDecoration: "none",
              fontSize: "1em",
              fontWeight: "700",
              letterSpacing: "1px",
              padding: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              borderLeft: location.pathname === "/menu" ? "3px solid #ff6b35" : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Menu
            <img
              src="/Icons/dropdown-arrow.svg"
              alt="dropdown"
              style={{
                width: "12px",
                height: "12px",
                filter: "brightness(0) invert(1)",
                transform: mobileMenusDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </div>

          {/* Mobile Dropdown Items */}
          {mobileMenusDropdownOpen && (
            <div style={{ paddingLeft: "20px" }}>
              {["Breakfast", "Lunch", "Dinner", "Drinks"].map((item) => (
                <Link
                  key={item}
                  to={`/menu?category=${item.toLowerCase()}`}
                  onClick={() => {
                    setMenuOpen(false);
                    setMobileMenusDropdownOpen(false);
                  }}
                  style={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "0.9em",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    padding: "8px 10px",
                    display: "block",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {item}
                </Link>
              ))}
            </div>
          )}

          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            style={{
              color: location.pathname === "/contact" ? "#ff6b35" : "white",
              textDecoration: "none",
              fontSize: "1em",
              fontWeight: "700",
              letterSpacing: "1px",
              padding: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              borderLeft: location.pathname === "/contact" ? "3px solid #ff6b35" : "3px solid transparent",
            }}
          >
            Contact
          </Link>

          {/* Mobile Reserve Button */}
          <button
            onClick={() => {
              setMenuOpen(false);
              onReserveClick();
            }}
            style={{
              backgroundColor: "#5ea34d",
              fontFamily: "'Sansita Swashed', sans-serif",
              color: "white",
              border: "none",
              padding: "15px 20px",
              fontSize: "0.9em",
              fontWeight: "600",
              letterSpacing: "1px",
              cursor: "pointer",
              borderRadius: "25px",
              marginTop: "15px",
              width: "100%",
            }}
          >
            Reserve a Table
          </button>
        </div>
      )}
    </>
  );
}
