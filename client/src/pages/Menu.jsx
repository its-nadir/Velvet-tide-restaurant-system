import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeTab, setActiveTab] = useState("BREAKFAST");
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle URL parameter for category
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      const upperCategory = category.toUpperCase();
      if (["BREAKFAST", "LUNCH", "DINNER", "DRINKS"].includes(upperCategory)) {
        setActiveTab(upperCategory);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/menu`);
        if (!response.ok) {
          throw new Error("Unable to load menu items.");
        }
        const data = await response.json();
        setMenuItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load menu items.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [API_BASE_URL]);

  const menuCategories = useMemo(
    () => [
      {
        id: 1,
        title: "BREAKFAST",
        description: "Start your day with our delicious breakfast options",
      
      },
      {
        id: 2,
        title: "LUNCH",
        description: "Enjoy our carefully crafted lunch selections",
       
      },
      {
        id: 3,
        title: "DINNER",
        description: "Experience fine dining with our dinner menu",
       
      },
      {
        id: 4,
        title: "DRINKS",
        description: "Refresh yourself with our beverage collection",
       
      },
    ],
    []
  );

  const formatPrice = (value) => {
    if (value === null || value === undefined) return "";
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return String(value);
    return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2);
  };

  const menuData = useMemo(() => {
    if (!menuItems.length) return {};
    const grouped = menuItems.reduce((acc, item) => {
      const categoryKey = (item.category || "OTHER").toUpperCase();
      const subcategoryKey = item.subcategory || "Chef's Selection";
      if (!acc[categoryKey]) acc[categoryKey] = {};
      if (!acc[categoryKey][subcategoryKey]) acc[categoryKey][subcategoryKey] = [];
      acc[categoryKey][subcategoryKey].push({
        name: item.name,
        description: item.description,
        price: formatPrice(item.price),
      });
      return acc;
    }, {});

    const ordered = {};
    menuCategories.forEach(({ title }) => {
      if (grouped[title]) {
        ordered[title] = {
          categories: Object.entries(grouped[title]).map(([name, items]) => ({
            name,
            items,
          })),
        };
      }
    });

    Object.entries(grouped).forEach(([key, value]) => {
      if (!ordered[key]) {
        ordered[key] = {
          categories: Object.entries(value).map(([name, items]) => ({
            name,
            items,
          })),
        };
      }
    });

    return ordered;
  }, [menuItems, menuCategories]);
  const isMobile = windowWidth <= 768;

  const activeMenu = menuData[activeTab];
  const firstColumn = activeMenu?.categories?.[0] || null;
  const secondColumn = activeMenu?.categories?.[1] || null;

  return (
    <div style={{ fontFamily: "'Lato', sans-serif", background: "#fff" }}>
      {/* Hero Section with Dark Background and Food Images */}
      <section
        style={{
          backgroundColor: "#fff",
          padding: windowWidth <= 768 ? "40px 20px" : "60px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: windowWidth <= 768 ? "30px" : "40px",
        }}
      >
        {/* Menu Title */}
        <h1
          style={{
            fontSize: windowWidth <= 768 ? "2.5em" : "3.5em",
            fontFamily: "'Dream Avenue'",
            fontStyle: "italic",
            fontWeight: "400",
            margin: 0,
            color: "#000",
            textAlign: "center",
            letterSpacing: "2px",
          }}
        >
          menu
        </h1>

        {/* Food Images Container */}
        <div
          style={{
            display: "flex",
            flexDirection: windowWidth <= 768 ? "column" : "row",
            gap: windowWidth <= 768 ? "20px" : "30px",
            maxWidth: "1000px",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Left Image */}
          <div
            style={{
             
              maxWidth: "400px",
              maxHeight: "300px",
              overflow: "hidden",
            }}
          >
            <img
              src="/Photos/img12.jpg"
              alt="Delicious dish"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Right Image */}
          <div
            style={{
              
              maxWidth: "250px",
              overflow: "hidden",
              marginLeft: "-60px",
            }}
          >
            <img
              src="/Photos/img10.jpg"
              alt="Delicious dish"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </section>

      {/* Menu Categories Section */}
      <section
        style={{
          maxWidth: "900px",
          margin: "80px auto",
          padding: "0 20px",
          textAlign: "center",
        }}
      >

        {/* Category Buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, auto))",
            gap: isMobile ? "12px" : "15px",
            justifyContent: "center",
            alignItems: "stretch",
            marginBottom: "60px",
            maxWidth: isMobile ? "520px" : "auto",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.title)}
              onMouseEnter={() => setHoveredItem(category.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                backgroundColor:
                  activeTab === category.title
                    ? "#5ea34d"
                    : hoveredItem === category.id
                    ? "#5ea34d"
                    : "#000",
                color: "#fff",
                border: "none",
                padding: isMobile ? "12px 18px" : "15px 40px",
                fontSize: isMobile ? "0.9em" : "1em",
                fontFamily: "'Lato', sans-serif",
                fontWeight: "600",
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s ease",
                borderRadius: "0px",
                width: "100%",
                marginTop: isMobile ? "0" : "-40px",
              }}
            >
              {category.title}
            </button>
          ))}
        </div>

        {/* Menu Items Display */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "40px 20px 80px",
            backgroundColor: "#fff",
          }}
        >
          {isLoading && (
            <p style={{ textAlign: "center", fontFamily: "'Lato', sans-serif", marginBottom: "30px" }}>
              Loading our seasonal menu...
            </p>
          )}
          {error && (
            <p
              style={{
                textAlign: "center",
                color: "#c7523f",
                fontFamily: "'Lato', sans-serif",
                marginBottom: "30px",
              }}
            >
              {error}
            </p>
          )}
          {!isLoading && !error && !firstColumn && !secondColumn && (
            <p style={{ textAlign: "center", fontFamily: "'Lato', sans-serif", marginBottom: "30px" }}>
              Menu coming soon. Please check back shortly.
            </p>
          )}

          {/* Two Column Layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: windowWidth <= 768 ? "1fr" : "1fr 1px 1fr",
              gap: windowWidth <= 768 ? "0" : "60px",
            }}
          >
            {/* Left Column */}
            <div>
              {firstColumn && (
                <>
                  {/* Category Title */}
                  <h2
                    style={{
                      fontSize: windowWidth <= 768 ? "1.8em" : "2.2em",
                      fontFamily: "'Dream Avenue'",
                      fontStyle: "italic",
                      fontWeight: "400",
                      color: "#000",
                      margin: "0 0 15px 0",
                      letterSpacing: "0px",
                    }}
                  >
                    {firstColumn.name}
                  </h2>

                  {/* Divider Line */}
                  <div
                    style={{
                      width: "100%",
                      height: "1px",
                      backgroundColor: "#000",
                      marginBottom: "30px",
                    }}
                  />

                  {/* Menu Items */}
                  {firstColumn.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "35px",
                        textAlign: "left",
                        marginLeft: "40px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: windowWidth <= 768 ? "0,9em" : "1em",
                          fontFamily: "montserrat",
                          fontWeight: "400",
                          textTransform: "uppercase",
                          color: "#000",
                          margin: "0 0 8px 0",
                          letterSpacing: "2px",
                        }}
                      >
                        {item.name}
                      </h3>
                      <p
                        style={{
                          fontSize: windowWidth <= 768 ? "0.75em" : "0.8em",
                          color: "#333",
                          lineHeight: "1.6",
                          margin: "0",
                          fontFamily: "helvetica",
                          fontWeight: "400",
                        }}
                      >
                        {item.description}{" "}
                        <span
                          style={{
                            fontWeight: "700",
                            color: "#000",
                          }}
                        >
                          {item.price}
                        </span>
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Vertical Divider (desktop only) */}
            {windowWidth > 768 && (
              <div
                style={{
                  width: "1px",
                  backgroundColor: "#000",
                  height: "auto",
                }}
              />
            )}

            {/* Right Column */}
            <div>
              {secondColumn && (
                <>
                  {/* Category Title */}
                  <h2
                    style={{
                      fontSize: windowWidth <= 768 ? "1.8em" : "2.2em",
                      fontFamily: "'Dream Avenue'",
                      fontStyle: "italic",
                      fontWeight: "400",
                      color: "#000",
                      margin: "0 0 15px 0",
                      letterSpacing: "0px",
                    }}
                  >
                    {secondColumn.name}
                  </h2>

                  {/* Divider Line */}
                  <div
                    style={{
                      width: "100%",
                      height: "1px",
                      backgroundColor: "#000",
                      marginBottom: "30px",
                    }}
                  />

                  {/* Menu Items */}
                  {secondColumn.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "35px",
                        textAlign: "left",
                        marginLeft: "40px",
                      }}
                    >
                     <h3
                        style={{
                          fontSize: windowWidth <= 768 ? "0,9em" : "1em",
                          fontFamily: "montserrat",
                          fontWeight: "400",
                          textTransform: "uppercase",
                          color: "#000",
                          margin: "0 0 8px 0",
                          letterSpacing: "2px",
                        }}
                      >
                        {item.name}
                      </h3>
                    <p
                        style={{
                          fontSize: windowWidth <= 768 ? "0.75em" : "0.8em",
                          color: "#333",
                          lineHeight: "1.6",
                          margin: "0",
                          fontFamily: "helvetica",
                          fontWeight: "400",
                        }}
                      >
                        {item.description}{" "}
                        <span
                          style={{
                            fontWeight: "700",
                            color: "#000",
                          }}
                        >
                          {item.price}
                        </span>
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Menu;
