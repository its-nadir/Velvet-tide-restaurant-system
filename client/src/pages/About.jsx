import React, { useState, useEffect } from "react";

const About = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredCard, setHoveredCard] = useState(null);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ fontFamily: "'Lato', sans-serif", background: "#fff" }}>
      {/* Hero Section with Image and About Text */}
      <section
        style={{
          padding: windowWidth <= 768 ? "20px" : "40px 60px 0",
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            position: "relative",
            height: windowWidth <= 768 ? "300px" : "350px",
            overflow: "hidden",
          }}
        >
          {/* Background Image */}
          <img
            src="/Photos/img7.jpg"
            alt="Delicious Food"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* White Container with "About" Text */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              zIndex: 2,
              backgroundColor: "#fff",
              padding: windowWidth <= 768 ? "15px 150px" : "20px 180px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1
              style={{
                fontSize: windowWidth <= 768 ? "2em" : "2.5em",
                fontFamily: "'Dream Avenue'",
                fontStyle: "italic",
                fontWeight: "400",
                margin: 0,
                color: "#000",
                lineHeight: "1",
              }}
            >
              About
            </h1>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section
        style={{
          maxWidth: "700px",
          margin: "80px auto",
          padding: "0 20px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: windowWidth <= 768 ? "1em" : "1.2em",
            lineHeight: "2",
            color: "#000",
            fontFamily: "helvatica",
            marginBottom: "20px",
          }}
        >
          " Velvet Tide Restaurant is a culinary destination where exceptional
          food meets warm hospitality. Founded in 2015, our restaurant has
          become a beloved gathering place for food lovers seeking authentic
          flavors and memorable dining experiences. We believe in using only the
          freshest ingredients, sourced locally whenever possible, to create
          dishes that delight the senses and nourish the soul."
        </p>
        <p
          style={{
            fontSize: windowWidth <= 768 ? "1em" : "1.2em",
            lineHeight: "2",
            color: "#000",
            fontFamily: "helvatica",
          }}
        >
          " Our passion for culinary excellence drives everything we do. From our
          carefully crafted menu to our attentive service, every detail is
          designed to ensure your visit is extraordinary."
        </p>
      </section>

      {/* Image & Text Grid Section */}
      <section
        style={{
          maxWidth: "900px",
          margin: "60px auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: windowWidth <= 768 ? "1fr" : "1fr 1fr",
            gap: "60px",
            marginBottom: "80px",
            alignItems: "center",

          }}
        >
          {/* Left Image */}
          <div
            style={{
              position: "relative",
              height: windowWidth <= 768 ? "300px" : "350px",
              width: windowWidth <= 768 ? "300px" : "400px",
              overflow: "hidden",
              display: windowWidth <= 768 ? "none" : "block",


            }}
          >
            <img
              src="/Photos/img4.jpg"
              alt="Restaurant Food"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Right Text Box */}
          <div
            style={{
              backgroundColor: "transparent",
              border: "2px solid #000",
              padding: windowWidth <= 768 ? "50px 40px" : "50px 30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginLeft: "25px",
              marginRight: "50px",
            }}
          >
            <h3
              style={{
                fontSize: windowWidth <= 768 ? "1.2em" : "1.4em",
                fontFamily: "dream avenue",
                color: "#000",
                marginBottom: "10px",
                textAlign: "center",
                fontWeight: "600",
                letterSpacing: "2px",
                marginTop: "-15px",
                
              }}
            >
              OUR APPROACH
            </h3>
            <p
              style={{
                fontSize: windowWidth <= 768 ? "0.9em" : "0.95em",
                lineHeight: "1.8",
                color: "#000",
                fontFamily: "helvatica",
                textAlign: "center",
                margin: 0,
              }}
            >
              We believe that great food starts with great ingredients. Our talented
              chefs work closely with local farmers and trusted suppliers to source the
              finest seasonal produce, sustainable seafood, and premium meats. Every
              dish is prepared with meticulous care, combining traditional techniques
              with modern culinary innovation, offering flavors that are both
              comfortingly familiar and delightfully exciting.
            </p>
          </div>
        </div>

        {/* Second Row - Reversed */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: windowWidth <= 768 ? "1fr" : "1fr 1fr",
            gap: "60px",
            alignItems: "center",
            marginTop: windowWidth <= 768 ? "40px" : "-80px",

          }}
        >
          {/* Left Text Box */}
          <div
           style={{
              backgroundColor: "transparent",
              border: "2px solid #000",
              padding: windowWidth <= 768 ? "50px 40px" : "50px 30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginLeft: "25px",
              marginRight: "50px",
            }}
          >
            <h3
              style={{
                fontSize: windowWidth <= 768 ? "1.2em" : "1.4em",
                fontFamily: "dream avenue",
                color: "#000",
                marginBottom: "10px",
                textAlign: "center",
                fontWeight: "600",
                letterSpacing: "2px",
                marginTop: "-15px",
              }}
            >
              OUR PHILOSOPHY
            </h3>
            <p
              style={{
                fontSize: windowWidth <= 768 ? "0.9em" : "0.95em",
                lineHeight: "1.8",
                color: "#000",
                fontFamily: "helvatica",
                textAlign: "center",
              }}
            >
              At Velvet Tide, dining is more than just a meal—it's an
              experience. We've created a warm, inviting atmosphere where
              friends and family can gather to celebrate life's special moments.
              Our dedicated team is committed to providing exceptional service
              that makes every guest feel valued and welcome. From intimate
              dinners to large celebrations, we're here to make your experience
              unforgettable.
            </p>
          </div>

          {/* Right Image */}
          <div
            style={{
              position: "relative",
              height: windowWidth <= 768 ? "300px" : "350px",
              width: windowWidth <= 768 ? "300px" : "400px",
              order: windowWidth <= 768 ? 1 : 2,
              overflow: "hidden",
              display: windowWidth <= 768 ? "none" : "block",


            }}
          >
            <img
              src="/Photos/img5.jpg"
              alt="Restaurant Interior"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        style={{
          backgroundColor: "#fff",
          padding: "80px 20px",
          marginTop: "-60px",
        }}
      >
        <h2
          style={{
            fontSize: windowWidth <= 768 ? "2.5em" : "4em",
            fontFamily: "dream avenue",
            fontStyle: "italic",
            textAlign: "center",
            color: "#000",
            marginBottom: "80px",
            fontWeight: "400",
          }}
        >
          Team
        </h2>

        {/* Team Grid - First Row */}
        <div
          style={{
            maxWidth: "950px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns:
              windowWidth <= 768
                ? "1fr"
                : windowWidth <= 1024
                ? "repeat(2, 1fr)"
                : "repeat(4, 1fr)",
            gap: "50px",
            marginBottom: "30px",
          }}
        >
          {teamMembers.slice(0, 4).map((member, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
              }}
            >
              {/* Image */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "200px",
                  backgroundImage: `url('${member.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: "0",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Overlay that slides up */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: hoveredCard === index ? "100%" : "0%",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    transition: "height 0.4s ease",
                  }}
                ></div>
              </div>

              {/* Name Box with Border */}
              <div
                style={{
                  border: "2px solid #000",
                  padding: "12px 10px",
                  backgroundColor: "#fff",
                  marginBottom: "8px",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.85em",
                    fontFamily: "helvatica",
                    fontWeight: "400",
                    color: "#000",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    lineHeight: "1.3",
                  }}
                >
                  {member.name}
                </h3>
              </div>

              {/* Title Below Box */}
              <p
                style={{
                  fontSize: "0.8em",
                  color: "#666",
                  fontFamily: "Georgia, serif",
                  fontStyle: "normal",
                  margin: 0,
                  marginTop: "5px",
                }}
              >
                {member.title}
              </p>
            </div>
          ))}
        </div>

        {/* Team Grid - Second Row */}
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns:
              windowWidth <= 768
                ? "1fr"
                : windowWidth <= 1024
                ? "repeat(2, 1fr)"
                : "repeat(3, 1fr)",
            gap: "50px",
          }}
        >
          {teamMembers.slice(4, 7).map((member, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
              }}
            >
              {/* Image */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "200px",
                  backgroundImage: `url('${member.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: "0",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredCard(index + 4)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Overlay that slides up */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: hoveredCard === index + 4 ? "100%" : "0%",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    transition: "height 0.4s ease",
                  }}
                ></div>
              </div>

              {/* Name Box with Border */}
              <div
                style={{
                  border: "2px solid #000",
                  padding: "12px 10px",
                  backgroundColor: "#fff",
                  marginBottom: "8px",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.85em",
                    fontFamily: "helvatica",
                    fontWeight: "400",
                    color: "#000",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    lineHeight: "1.3",
                  }}
                >
                  {member.name}
                </h3>
              </div>

              {/* Title Below Box */}
              <p
                style={{
                  fontSize: "0.8em",
                  color: "#666",
                  fontFamily: "Georgia, serif",
                  fontStyle: "normal",
                  margin: 0,
                  marginTop: "5px",
                }}
              >
                {member.title}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Team Members Data
const teamMembers = [
  {
    name: "OBIF FERGUSON",
    title: "Executive Chef",
    image: "/Photos/chef 1.jpg",
  },
  {
    name: "DIAN GUZMAN",
    title: "General Manager",
    image: "/Photos/chef 4.jpg",
  },
  {
    name: "JOE BEE",
    title: "Head Chef",
    image: "/Photos/chef 2.jpg",
  },
  {
    name: "HELENA LARSON",
    title: "Area Director",
    image: "/Photos/chef 7.jpg",
  },
  {
    name: "KEVIN KRAPP",
    title: "Assistant General ",
    image: "/Photos/chef 8.jpg",
  },
  {
    name: "VONDA FREEMAN",
    title: "Director of Beverage Programs",
    image: "/Photos/chef 6.jpg",
  },
  {
    name: "STEVE PALMER",
    title: "Founder",
    image: "/Photos/chef 5.jpg",
  },
];

export default About;
