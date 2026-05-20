import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReservationPopup from "../components/ReservationPopup";

const REVIEW_DATA = [
  {
    lines: [
      '"I had great service and a tasty salmon Benedict for breakfast',
      "while in town for business. I'd definitely go back for lunch or dinner.\"",
    ],
    author: "Brevardrox - Trip Advisor",
  },
  {
    lines: [
      '"Absolutely amazing experience! The food was exquisite and the ambiance was perfect.',
      "Will definitely be coming back with friends and family.\"",
    ],
    author: "Sarah M. - Google Reviews",
  },
  {
    lines: [
      '"The best dining experience I\'ve had in years. Every dish was perfectly prepared',
      "and beautifully presented. Outstanding service too!\"",
    ],
    author: "Michael R. - Yelp",
  },
  {
    lines: [
      '"A hidden gem! The atmosphere is cozy and elegant, and the menu offers something for everyone.',
      'Highly recommend the chef\'s special!"',
    ],
    author: "Emily T. - Facebook",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menusDropdownOpen, setMenusDropdownOpen] = useState(false);
  const [mobileMenusDropdownOpen, setMobileMenusDropdownOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  const navigate = useNavigate();

  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menusDropdownOpen && !event.target.closest('.menus-dropdown-container')) {
        setMenusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menusDropdownOpen]);

  const activeReview = REVIEW_DATA[activeReviewIndex];
  const handleReviewChange = (nextIndex) => {
    const total = REVIEW_DATA.length;
    if (!total) return;
    const normalizedIndex = ((nextIndex % total) + total) % total;
    setActiveReviewIndex(normalizedIndex);
  };
  const handleNextReview = () => handleReviewChange(activeReviewIndex + 1);
  const handlePreviousReview = () => handleReviewChange(activeReviewIndex - 1);

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

            /* Show overlay and text on small screens */
            .feature-card .card-overlay {
              height: 100% !important;
            }
            .feature-card .card-content {
              bottom: 50% !important;
              transform: translateY(50%) !important;
            }
            .feature-card .card-desc {
              opacity: 1 !important;
              max-height: 200px !important;
            }

            /* Visit Our Restaurant Section - Mobile Responsive */
            .visit-section {
              margin: 40px 0 !important;
              height: auto !important;
              max-width: 100% !important;
              overflow: hidden !important;
            }

            .visit-text-box {
              position: relative !important;
              width: 100% !important;
              left: 0 !important;
            }

            .visit-text-box > div {
              padding: 40px 25px !important;
            }

            .visit-image-box {
              display: none !important;
            }
          }
          @media (min-width: 769px) {
            .mobile-menu-container {
              display: none !important;
            }
          }
        `}
      </style>
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          background: "#f8f8f8",
          minHeight: "100vh",
        }}
      >
        

      {/* Mobile Menu - Shown when hamburger is clicked */}
      {menuOpen && (
        <div
          className="mobile-menu-container"
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            position: "absolute",
            top: "85px",
            left: 0,
            right: 0,
            zIndex: 999,
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          }}
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "1em",
              fontWeight: "700",
              letterSpacing: "1px",
              padding: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "1em",
              fontWeight: "700",
              letterSpacing: "1px",
              padding: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            Our Story
          </Link>

          {/* Menu with Dropdown in Mobile */}
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <div
              onClick={() => setMobileMenusDropdownOpen(!mobileMenusDropdownOpen)}
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "1em",
                fontWeight: "700",
                letterSpacing: "1px",
                padding: "10px",
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

            {/* Mobile Submenu */}
            {mobileMenusDropdownOpen && (
              <div style={{ backgroundColor: "#1a1a1a", paddingLeft: "20px" }}>
                <a
                  href="#breakfast"
                  onClick={() => {
                    setMenuOpen(false);
                    setMobileMenusDropdownOpen(false);
                  }}
                  style={{
                    color: "#e0e0e0",
                    textDecoration: "none",
                    fontSize: "0.9em",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    padding: "10px",
                    display: "block",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  Breakfast
                </a>
                <a
                  href="#lunch"
                  onClick={() => {
                    setMenuOpen(false);
                    setMobileMenusDropdownOpen(false);
                  }}
                  style={{
                    color: "#e0e0e0",
                    textDecoration: "none",
                    fontSize: "0.9em",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    padding: "10px",
                    display: "block",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  Lunch
                </a>
                <a
                  href="#dinner"
                  onClick={() => {
                    setMenuOpen(false);
                    setMobileMenusDropdownOpen(false);
                  }}
                  style={{
                    color: "#e0e0e0",
                    textDecoration: "none",
                    fontSize: "0.9em",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    padding: "10px",
                    display: "block",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  Dinner
                </a>
                <a
                  href="#drinks"
                  onClick={() => {
                    setMenuOpen(false);
                    setMobileMenusDropdownOpen(false);
                  }}
                  style={{
                    color: "#e0e0e0",
                    textDecoration: "none",
                    fontSize: "0.9em",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    padding: "10px",
                    display: "block",
                  }}
                >
                  Drinks
                </a>
              </div>
            )}
          </div>

          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "1em",
              fontWeight: "700",
              letterSpacing: "1px",
              padding: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            Contact
          </Link>

          {/* Reserve a Table Button in Mobile Menu */}
          <button
            onClick={() => {
              setMenuOpen(false);
              setIsReservationOpen(true);
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
              marginTop: "10px",
              width: "100%",
            }}
          >
            Reserve a Table
          </button>

          {/* Social Media Icons in Mobile Menu */}
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "20px" }}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex" }}
            >
              <img
                src="/Icons/facebook.svg"
                alt="Facebook"
                style={{ width: "24px", height: "24px" }}
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex" }}
            >
              <img
                src="/Icons/instagram.svg"
                alt="Instagram"
                style={{ width: "24px", height: "24px" }}
              />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex" }}
            >
              <img
                src="/Icons/pinterest.svg"
                alt="Pinterest"
                style={{ width: "24px", height: "24px" }}
              />
            </a>
          </div>
        </div>
      )}

      {/* Hero Banner with Background Image */}
      <section
        id="about"
        style={{
          position: "relative",
          height: window.innerWidth <= 768 ? "400px" : "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: window.innerWidth <= 768 ? "20px" : "60px",
          paddingRight: window.innerWidth <= 768 ? "20px" : "0",
          overflow: "hidden",
        }}
      >
        {/* Background Image */}
        <img
          src="../../public/photos/Banner 1.png"
          alt="Restaurant Banner"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, color: "white" }}>
          {/* Small text */}
          <p
            style={{
              fontSize: windowWidth <= 768 ? "0.75em" : "1em",
              fontWeight: "400",
              letterSpacing: windowWidth <= 768 ? "1px" : "1.5px",
              margin: 0,
              marginBottom: windowWidth <= 768 ? "10px" : "15px",
              color: "#f5d5a8",
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
              marginTop: windowWidth <= 768 ? "-10px" : "-20px",
              marginLeft: windowWidth <= 768 ? "5px" : "10px",
            }}
          >
            Dive Into Deep
          </p>

          {/* Heading text */}
          <h1
            style={{
              fontSize: windowWidth <= 480 ? "1.8em" : windowWidth <= 768 ? "2.5em" : "3.5em",
              fontWeight: "bold",
              letterSpacing: windowWidth <= 768 ? "0.5px" : "2px",
              margin: 0,
              marginBottom: windowWidth <= 768 ? "20px" : "30px",
              lineHeight: "1.2",
              fontFamily: "'Sansita Swashed', cursive",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              marginLeft: windowWidth <= 768 ? "5px" : "10px",
              maxWidth: windowWidth <= 768 ? "90%" : "100%",
              wordWrap: "break-word",
            }}
          >
            Smooth Textures.<br />Deep Flavors.
          </h1>

          {/* Buttons */}
          <div style={{
            display: "flex",
            flexDirection: windowWidth <= 768 ? "column" : "row",
            gap: windowWidth <= 768 ? "15px" : "20px",
            marginTop: windowWidth <= 768 ? "20px" : "30px",
            width: windowWidth <= 768 ? "100%" : "auto",
          }}>
            <button
              onClick={() => navigate('/menu')}
              style={{
                backgroundColor: "#ff6b35",
                color: "white",
                border: "none",
                padding: windowWidth <= 768 ? "12px 25px" : "15px 30px",
                fontSize: windowWidth <= 768 ? "0.65em" : "0.75em",
                fontWeight: "600",
                letterSpacing: "1px",
                cursor: "pointer",
                borderRadius: "25px",
                transition: "all 0.3s",
                textTransform: "uppercase",
                fontFamily: "'montserrat', sans-serif",
                marginTop: windowWidth <= 768 ? "20px" : "40px",
                marginLeft: window.innerWidth <= 768 ? "5px" : "10px",
                width: window.innerWidth <= 768 ? "100%" : "auto",
              }}
              onMouseOver={(e) => {

                e.target.style.transform = "translateY(-4px)";
              }}

            >
              Explore Menu
            </button>

            <button
              onClick={() => setIsReservationOpen(true)}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "2px solid white",
                padding: window.innerWidth <= 768 ? "12px 25px" : "15px 30px",
                fontSize: window.innerWidth <= 768 ? "0.65em" : "0.75em",
                fontWeight: "600",
                letterSpacing: "1px",
                cursor: "pointer",
                borderRadius: "25px",
                transition: "all 0.3s",
                textTransform: "uppercase",
                fontFamily: "'montserrat', sans-serif",
                marginTop: window.innerWidth <= 768 ? "0" : "40px",
                marginLeft: window.innerWidth <= 768 ? "5px" : "0",
                width: window.innerWidth <= 768 ? "100%" : "auto",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "white";
                e.target.style.color = "#1a1a1a";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "white";
              }}
            >
              Make a Reservation
            </button>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section style={{
        backgroundColor: "white",
        padding: windowWidth <= 768 ? "60px 30px" : "100px 80px",
        display: "flex",
        flexDirection: windowWidth <= 768 ? "column" : "row",
        alignItems: "center",
        gap: windowWidth <= 768 ? "40px" : "60px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}>
        {/* Left Content */}
        <div style={{
          flex: 1,
          maxWidth: windowWidth <= 768 ? "100%" : "500px",
        }}>
          <h2 style={{
            fontSize: windowWidth <= 768 ? "2em" : "2.5em",
            color: "#1a1a1a",
            fontWeight: "400",
            marginBottom: "30px",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Welcome to <span style={{ color: "#ff6b35", fontStyle: "italic" }}>Velvet Tide's</span>
          </h2>

          <p style={{
            fontSize: windowWidth <= 768 ? "0.95em" : "1em",
            color: "#4a4a4a",
            lineHeight: "1.8",
            marginBottom: "25px",
            fontFamily: "'Inter', sans-serif",
          }}>
            "Real Food Done Real Good" was a slogan that was brought to Velvet Tide's with the first owner, Heidi Trull. I really liked this slogan and decided to keep it. My mission is to make everything from scratch. This means bringing in great product and treating it with the most care and creativity it deserves. From our burgers to our finest seafood dishes and handcrafted cocktails, we strive for excellent techniques and outstanding personal service. We do this while creating a comfortable low-key atmosphere with plenty of neighborhood funk...a place for everyone that is approachable and reliable.
          </p>

          <p style={{
            fontSize: windowWidth <= 768 ? "0.9em" : "0.95em",
            color: "#666",
            fontStyle: "italic",
            marginBottom: "30px",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            -Chef Bryon Peck
          </p>

          <button
            onClick={() => navigate('/about')}
            style={{
              backgroundColor: "#ff6b35",
              color: "white",
              border: "none",
              padding: windowWidth <= 768 ? "12px 30px" : "15px 35px",
              fontSize: windowWidth <= 768 ? "0.85em" : "0.9em",
              fontWeight: "600",
              letterSpacing: "1px",
              cursor: "pointer",
              borderRadius: "25px",
              transition: "all 0.3s",
              textTransform: "uppercase",
              fontFamily: "'montserrat', sans-serif",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#e55a2b";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#ff6b35";
              e.target.style.transform = "translateY(0)";
            }}
          >
            About Us
          </button>
        </div>

        {/* Right Image - Hidden on mobile */}
        {windowWidth > 768 && (
          <div style={{
            flex: 1,
            maxWidth: "500px",
            height: "400px",
          }}>
            <img
              src="/Photos/img1.png"
              alt="Delicious dish"
              style={{
                width: "100%",
                height: "120%",
                objectFit: "cover",

              }}
            />
          </div>
        )}
      </section>

      {/* Three Cards Section */}
      <section style={{
        padding: "80px 60px",
        backgroundColor: "#f8f8f8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "30px",
        flexWrap: "wrap",
        marginBottom: "-60px",
      }}>
        {/* Card 1 - The Freshest Food */}
        <div
          className="feature-card"
          onMouseEnter={(e) => {
            if (window.innerWidth > 768) {
              e.currentTarget.querySelector('.card-overlay').style.height = '100%';
              e.currentTarget.querySelector('.card-content').style.bottom = '50%';
              e.currentTarget.querySelector('.card-content').style.transform = 'translateY(50%)';
              e.currentTarget.querySelector('.card-desc').style.opacity = '1';
              e.currentTarget.querySelector('.card-desc').style.maxHeight = '200px';
            }
          }}
          onMouseLeave={(e) => {
            if (window.innerWidth > 768) {
              e.currentTarget.querySelector('.card-overlay').style.height = '0%';
              e.currentTarget.querySelector('.card-content').style.bottom = '20px';
              e.currentTarget.querySelector('.card-content').style.transform = 'translateY(0)';
              e.currentTarget.querySelector('.card-desc').style.opacity = '0';
              e.currentTarget.querySelector('.card-desc').style.maxHeight = '0';
            }
          }}
          style={{
            position: "relative",
            width: "300px",
            height: "400px",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <img
            src="/Photos/img1.jpg"
            alt="The Freshest Food"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Border Frame */}
          <div style={{
            position: "absolute",
            top: "15px",
            left: "15px",
            right: "15px",
            bottom: "15px",
            border: "2px solid white",
            pointerEvents: "none",
          }} />

          {/* Color Overlay - slides from bottom to top */}
          <div className="card-overlay" style={{
            position: "absolute",
            left: "0",
            right: "0",
            bottom: "0",
            height: "0%",
            background: "linear-gradient(to top, rgba(198, 124, 78, 0.95), rgba(198, 124, 78, 0))",
            transition: "height 0.5s ease",
            pointerEvents: "none",
          }} />

          {/* Content (heading + description) */}
          <div className="card-content" style={{
            position: "absolute",
            bottom: "20px",
            left: "35px",
            right: "35px",
            transition: "all 0.5s ease",
            pointerEvents: "none",
          }}>
            <h3 style={{
              fontSize: "1.4em",
              fontWeight: "bold",
              color: "white",
              fontFamily: "montserrat', sans-serif",
              textAlign: "center",
              textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
              margin: "0",
            }}>
              Fresh Daily
            </h3>

            {/* Description */}
            <div className="card-desc" style={{
              maxHeight: "0",
              opacity: "0",
              overflow: "hidden",
              transition: "all 0.5s ease",
              marginTop: "15px",
            }}>
              <p style={{
                color: "white",
                fontSize: "0.85em",
                textAlign: "center",
                lineHeight: "1.6",
                margin: "0",
                fontFamily: "helvetica",
              }}>
                Experience the finest ingredients prepared fresh daily by our expert culinary team.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 - Professional Chefs */}
        <div
          className="feature-card"
          onMouseEnter={(e) => {
            if (window.innerWidth > 768) {
              e.currentTarget.querySelector('.card-overlay').style.height = '100%';
              e.currentTarget.querySelector('.card-content').style.bottom = '50%';
              e.currentTarget.querySelector('.card-content').style.transform = 'translateY(50%)';
              e.currentTarget.querySelector('.card-desc').style.opacity = '1';
              e.currentTarget.querySelector('.card-desc').style.maxHeight = '200px';
            }
          }}
          onMouseLeave={(e) => {
            if (window.innerWidth > 768) {
              e.currentTarget.querySelector('.card-overlay').style.height = '0%';
              e.currentTarget.querySelector('.card-content').style.bottom = '20px';
              e.currentTarget.querySelector('.card-content').style.transform = 'translateY(0)';
              e.currentTarget.querySelector('.card-desc').style.opacity = '0';
              e.currentTarget.querySelector('.card-desc').style.maxHeight = '0';
            }
          }}
          style={{
            position: "relative",
            width: "300px",
            height: "400px",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <img
            src="/Photos/img3.jpg"
            alt="Professional Chefs"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Border Frame */}
          <div style={{
            position: "absolute",
            top: "15px",
            left: "15px",
            right: "15px",
            bottom: "15px",
            border: "2px solid white",
            pointerEvents: "none",
          }} />

          {/* Color Overlay - slides from bottom to top */}
          <div className="card-overlay" style={{
            position: "absolute",
            left: "0",
            right: "0",
            bottom: "0",
            height: "0%",
            background: "linear-gradient(to top, rgba(198, 124, 78, 0.95), rgba(198, 124, 78, 0))",
            transition: "height 0.5s ease",
            pointerEvents: "none",
          }} />

          {/* Content (heading + description) */}
          <div className="card-content" style={{
            position: "absolute",
            bottom: "20px",
            left: "35px",
            right: "35px",
            transition: "all 0.5s ease",
            pointerEvents: "none",
          }}>
            <h3 style={{
              fontSize: "1.4em",
              fontWeight: "bold",
              color: "white",
              fontFamily: "montserrat', sans-serif",
              textAlign: "center",
              textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
            
            }}>
              Master Chefs
            </h3>

            {/* Description */}
            <div className="card-desc" style={{
              maxHeight: "0",
              opacity: "0",
              overflow: "hidden",
              transition: "all 0.5s ease",
              marginTop: "15px",
            }}>
              <p style={{
                color: "white",
                fontSize: "0.85em",
                textAlign: "center",
                lineHeight: "1.6",
                margin: "0",
                fontFamily: "helvetica",
              }}>
                Our talented chefs bring years of experience and passion to every dish they create.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 - Casual Elegance */}
        <div
          className="feature-card"
          onMouseEnter={(e) => {
            if (window.innerWidth > 768) {
              e.currentTarget.querySelector('.card-overlay').style.height = '100%';
              e.currentTarget.querySelector('.card-content').style.bottom = '50%';
              e.currentTarget.querySelector('.card-content').style.transform = 'translateY(50%)';
              e.currentTarget.querySelector('.card-desc').style.opacity = '1';
              e.currentTarget.querySelector('.card-desc').style.maxHeight = '200px';
            }
          }}
          onMouseLeave={(e) => {
            if (window.innerWidth > 768) {
              e.currentTarget.querySelector('.card-overlay').style.height = '0%';
              e.currentTarget.querySelector('.card-content').style.bottom = '20px';
              e.currentTarget.querySelector('.card-content').style.transform = 'translateY(0)';
              e.currentTarget.querySelector('.card-desc').style.opacity = '0';
              e.currentTarget.querySelector('.card-desc').style.maxHeight = '0';
            }
          }}
          style={{
            position: "relative",
            width: "300px",
            height: "400px",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <img
            src="/Photos/img2.jpg"
            alt="Casual Elegance"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Border Frame */}
          <div style={{
            position: "absolute",
            top: "15px",
            left: "15px",
            right: "15px",
            bottom: "15px",
            border: "2px solid white",
            pointerEvents: "none",
          }} />

          {/* Color Overlay - slides from bottom to top */}
          <div className="card-overlay" style={{
            position: "absolute",
            left: "0",
            right: "0",
            bottom: "0",
            height: "0%",
            background: "linear-gradient(to top, rgba(198, 124, 78, 0.95), rgba(198, 124, 78, 0))",
            transition: "height 0.5s ease",
            pointerEvents: "none",
          }} />

          {/* Content (heading + description) */}
          <div className="card-content" style={{
            position: "absolute",
            bottom: "20px",
            left: "35px",
            right: "35px",
            transition: "all 0.5s ease",
            pointerEvents: "none",
          }}>
            <h3 style={{
              fontSize: "1.4em",
              fontWeight: "bold",
              color: "white",
              fontFamily: "montserrat', sans-serif",
              textAlign: "center",
              textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
             
            }}>
              Casual Elegance
            </h3>

            {/* Description */}
            <div className="card-desc" style={{
              maxHeight: "0",
              opacity: "0",
              overflow: "hidden",
              transition: "all 0.5s ease",
              marginTop: "15px",
            }}>
              <p style={{
                color: "white",
                fontSize: "0.85em",
                textAlign: "center",
                lineHeight: "1.6",
                margin: "0",
                fontFamily: "helvetica",
              }}>
                No fuss attire required here! Come as you are and experience a variety of dishes, and drinks that will put a smile on your face.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Crafty Cocktails Section */}
      <section
        style={{
          position: "relative",
          height: "500px",
          backgroundImage: "url('/Photos/img5.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "80px",
          overflow: "hidden",
  
        }}
      >
        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            color: "white",
            padding: "0 20px",
            maxWidth: "950px",
          }}
        >
          <h2
            style={{
              fontSize: "2em",
              fontWeight: "700",
              marginBottom: "35px",
              letterSpacing: "3px",
              textShadow: "3px 3px 6px rgba(0, 0, 0, 0.6)",
              fontFamily: "'Playfair Display', 'Georgia', serif",
              lineHeight: "1.2",
            }}
          >
            Exquisite Flavors Await You
          </h2>
          <p
            style={{
              fontSize: "0.95em",
              lineHeight: "1",
              marginBottom: "15px",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)",
              fontFamily: "'Lato', 'Arial', sans-serif",
              fontWeight: "300",
              letterSpacing: "0.5px",
            }}
          >
            "Experience our carefully curated selection of premium dishes,
          </p>
          <p
            style={{
              fontSize: "0.95em",
              lineHeight: "1",
              marginBottom: "45px",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)",
              fontFamily: "'Lato', 'Arial', sans-serif",
              fontWeight: "300",
              letterSpacing: "0.5px",
            }}
          >
            crafted with passion and served with excellence"
          </p>
          <button
            onClick={() => navigate('/menu')}
            style={{
              padding: "12px 30px",
              fontSize: "0.8em",
              fontWeight: "600",
              letterSpacing: "1.5px",
              color: "white",
              backgroundColor: "transparent",
              border: "1.5px solid white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              fontFamily: "montserrat', sans-serif",
              borderColor:"#fff",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#000000";
              e.currentTarget.style.borderColor = "#000000";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "#fff";

            }}
          >
            Explore Our Menu
          </button>
        </div>

        {/* Decorative wave at bottom */}
        <svg
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "80px",
            zIndex: 2,
          }}
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
            fill="#f8f8f8"
          />
        </svg>
      </section>

      {/* What Customers Say Section */}
      <section
        style={{
          backgroundColor: "#f8f8f8",
          padding: "80px 20px",
          marginTop: "-40px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h2
          style={{
            fontSize: windowWidth <= 768 ? "1.6em" : "2.8em",
            fontWeight: "700",
            marginBottom: "40px",
            color: "#1a1a1a",
            fontFamily: "'Playfair Display', 'Georgia', serif",
          }}
        >
          What Customers Say
        </h2>

        {/* Large Quote Icon */}
        <div
          style={{
            fontSize: "5em",
            color: "#5ea34d",
            marginBottom: "30px",
            fontFamily: "Georgia, serif",
            lineHeight: "0.5",
          }}
        >
          ❝
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: windowWidth <= 768 ? "12px" : "24px",
            marginTop: windowWidth <= 768 ? "10px" : "20px",
            flexWrap: windowWidth <= 640 ? "wrap" : "nowrap",
          }}
        >
          <button
            type="button"
            onClick={handlePreviousReview}
            aria-label="Previous review"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/Icons/right-arrow.png"
              alt=""
              style={{ width: 20, height: 20, transform: "rotate(180deg)" }}
            />
          </button>

          <div style={{ maxWidth: "700px", textAlign: "center" }}>
            {/* Review Text */}
            <p
              style={{
                fontSize: windowWidth <= 768 ? "0.9em" : "1.1em",
                lineHeight: "1.8",
                color: "#333",
                margin: "0 auto 30px",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {activeReview.lines.map((line, index) => (
                <span key={`${activeReview.author}-${index}`}>
                  {line}
                  {index < activeReview.lines.length - 1 && <br />}
                </span>
              ))}
            </p>

            {/* Reviewer Name */}
            <p
              style={{
                fontSize: windowWidth <= 768 ? "0.85em" : "0.95em",
                color: "#666",
                fontWeight: "600",
                marginBottom: "25px",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {activeReview.author}
            </p>

            {/* Navigation Dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              {REVIEW_DATA.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleReviewChange(index)}
                  className="review-dot"
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: index === activeReviewIndex ? "#5ea34d" : "#ddd",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextReview}
            aria-label="Next review"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/Icons/right-arrow.png"
              alt=""
              style={{ width: 20, height: 20 }}
            />
          </button>
        </div>
      </section>

            {/* Visit The Spoon Section */}
      <section
        className="visit-section"
        style={{
          position: "relative",
          maxWidth: "900px",
          margin: "80px auto",
          height: "400px",
          marginTop: "-5px",
        }}
      >
        {/* Brown Background Box */}
        <div
          className="visit-text-box"
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: "55%",
            height: "100%",
            backgroundColor: "#000",
            zIndex: "1",
          }}
        >
          <div
            style={{
              padding: "20px 50px",
              color: "white",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.7em",
                  fontWeight: "700",       
                  lineHeight: "1.5",
                  fontFamily: "'helvetica', sans-serif",
                }}
              >
                Visit
                <br />
                Our Restaurant
              </h2>
              <div
                style={{
                  width: "80px",
                  height: "3px",
                  backgroundColor: "#ff6b35",
                  marginTop: "10px",
                  marginBottom: "20px",
                }}
              />
            </div>

            {/* Opening Hours */}
            <div style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "0.75em",
                  fontWeight: "700",
                  letterSpacing: "2px",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                OPENING HOURS
              </h3>
              <p
                style={{
                  fontSize: "0.65em",
                  lineHeight: "1.6",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: "300",
                  marginBottom: "5px",
                }}
              >
                Monday – Saturday || 09:00 AM — 9:00 PM
              </p>
              <p
                style={{
                  fontSize: "0.65em",
                  lineHeight: "1",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: "300",
                }}
              >
                Sunday || Closed
              </p>
            </div>

            {/* Our Location */}
            <div>
              <h3
                style={{
                  fontSize: "0.75em",
                  fontWeight: "700",
                  letterSpacing: "2px",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                OUR LOCATION
              </h3>
              <p
                style={{
                  fontSize: "0.65em",
                  lineHeight: "1",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: "300",
                }}
              >
                1419 E. Michigan Avenue • Lansing, Michigan
              </p>
            </div>
          </div>
        </div>

        {/* Image - Overlapping */}
        <div
          className="visit-image-box"
          style={{
            position: "absolute",
            right: "0",
            top: "30px",
            width: "60%",
            height: "340px",
            backgroundImage: "url('/Photos/img6.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: "2",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          }}
        />
      </section>
    </div>

    <ReservationPopup
      isOpen={isReservationOpen}
      onClose={() => setIsReservationOpen(false)}
    />
    </>
  );
}
