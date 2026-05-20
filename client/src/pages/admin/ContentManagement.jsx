import React, { useEffect, useState } from "react";
import {
  adminTheme,
  buttonStyle,
  createCardStyle,
  createChipStyle,
  fieldLabelStyle,
  sectionHeadingStyle,
  textInputStyle,
  textareaStyle,
  underlineStyle,
} from "./adminTheme";

export const contentSections = [
  { id: "home", label: "Home page", caption: "Hero & featured CTA" },
  { id: "about", label: "About page", caption: "Story & philosophy" },
  { id: "hours", label: "Opening hours", caption: "Weekly availability" },
  { id: "contact", label: "Contact info", caption: "How guests reach us" },
];

const defaultWelcome = {
  heading: "Welcome to Velvet Tide's",
  paragraphOne:
    '"Real Food Done Real Good" was a slogan that was brought to Velvet Tide\'s with the first owner, Heidi Trull. I really liked this slogan and decided to keep it. My mission is to make everything from scratch. This means bringing in great product and treating it with the most care and creativity it deserves.',
  paragraphTwo:
    "From our burgers to our finest seafood dishes and handcrafted cocktails, we strive for excellent techniques and outstanding personal service. We do this while creating a comfortable low-key atmosphere with plenty of neighborhood funk...a place for everyone that is approachable and reliable.",
  signature: "-Chef Bryon Peck",
};

const defaultHours = [
  { day: "Tuesday", open: "18:00", close: "23:00" },
  { day: "Wednesday", open: "18:00", close: "23:00" },
  { day: "Thursday", open: "18:00", close: "23:00" },
  { day: "Friday", open: "18:00", close: "00:00" },
  { day: "Saturday", open: "11:00", close: "00:00" },
  { day: "Sunday", open: "11:00", close: "14:00" },
];

const defaultFeatureCards = [
  {
    title: "Fresh Daily",
    description: "Experience the finest ingredients prepared fresh daily by our expert culinary team.",
  },
  {
    title: "Master Chefs",
    description: "Our talented chefs bring years of experience and passion to every dish they create.",
  },
  {
    title: "Casual Elegance",
    description: "No fuss attire required here! Come as you are and enjoy our playful dishes and cocktails.",
  },
];

const defaultReviews = [
  {
    author: "Brevardrox - Trip Advisor",
    quote:
      "\"I had great service and a tasty salmon Benedict for breakfast while in town for business. I'd definitely go back for lunch or dinner.\"",
  },
  {
    author: "Sarah M. - Google Reviews",
    quote:
      '"Absolutely amazing experience! The food was exquisite and the ambiance was perfect. Will definitely be coming back with friends and family."',
  },
  {
    author: "Michael R. - Yelp",
    quote:
      '"The best dining experience I\'ve had in years. Every dish was perfectly prepared and beautifully presented. Outstanding service too!"',
  },
];

export default function ContentManagement() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={fieldLabelStyle} htmlFor="welcome-heading">
                Welcome heading
              </label>
              <input id="welcome-heading" type="text" style={textInputStyle} defaultValue={defaultWelcome.heading} />
            </div>
            <div>
              <label style={fieldLabelStyle} htmlFor="welcome-body-one">
                Welcome introduction
              </label>
              <textarea
                id="welcome-body-one"
                rows={4}
                style={textareaStyle}
                defaultValue={defaultWelcome.paragraphOne}
              />
            </div>
            <div>
              <label style={fieldLabelStyle} htmlFor="welcome-body-two">
                Welcome detail
              </label>
              <textarea
                id="welcome-body-two"
                rows={4}
                style={textareaStyle}
                defaultValue={defaultWelcome.paragraphTwo}
              />
            </div>
            <div>
              <label style={fieldLabelStyle} htmlFor="welcome-signature">
                Signature
              </label>
              <input id="welcome-signature" type="text" style={textInputStyle} defaultValue={defaultWelcome.signature} />
            </div>
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontWeight: 600, marginBottom: "8px" }}>Feature cards</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {defaultFeatureCards.map((card, index) => (
                  <div
                    key={card.title}
                    style={{
                      borderRadius: adminTheme.radii.lg,
                      border: `1px solid ${adminTheme.palette.border}`,
                      padding: "16px",
                      display: "grid",
                      gridTemplateColumns: windowWidth <= 640 ? "1fr" : "0.7fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label style={fieldLabelStyle} htmlFor={`card-title-${index}`}>
                        Card title
                      </label>
                      <input id={`card-title-${index}`} type="text" style={textInputStyle} defaultValue={card.title} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle} htmlFor={`card-desc-${index}`}>
                        Card description
                      </label>
                      <textarea
                        id={`card-desc-${index}`}
                        rows={3}
                        style={textareaStyle}
                        defaultValue={card.description}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontWeight: 600, marginBottom: "8px" }}>Reviews</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {defaultReviews.map((review, index) => (
                  <div
                    key={review.author}
                    style={{
                      borderRadius: adminTheme.radii.lg,
                      border: `1px solid ${adminTheme.palette.border}`,
                      padding: "16px",
                      display: "grid",
                      gridTemplateColumns: windowWidth <= 640 ? "1fr" : "0.8fr 1.2fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label style={fieldLabelStyle} htmlFor={`review-author-${index}`}>
                        Reviewer name
                      </label>
                      <input
                        id={`review-author-${index}`}
                        type="text"
                        style={textInputStyle}
                        defaultValue={review.author}
                      />
                    </div>
                    <div>
                      <label style={fieldLabelStyle} htmlFor={`review-quote-${index}`}>
                        Quote
                      </label>
                      <textarea
                        id={`review-quote-${index}`}
                        rows={3}
                        style={textareaStyle}
                        defaultValue={review.quote}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ color: adminTheme.palette.contrast, fontFamily: adminTheme.fonts.body }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={sectionHeadingStyle}>Content atelier</h1>
        <div style={underlineStyle} />

      </div>

      <div
        style={{
          ...createCardStyle({
            padding: "22px",
            marginBottom: "28px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }),
        }}
      >
        {contentSections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            style={{
              ...createChipStyle(activeSection === section.id ? "accent" : "neutral"),
              border: `1px solid ${
                activeSection === section.id ? adminTheme.palette.accent : adminTheme.palette.border
              }`,
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div
        style={{
          ...createCardStyle({
            padding: "30px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }),
        }}
      >
        <div>
          <div style={{ fontFamily: adminTheme.fonts.display, fontSize: "1.4rem" }}>
            {contentSections.find((section) => section.id === activeSection)?.label}
          </div>
          <div style={{ color: adminTheme.palette.textMuted, fontSize: "0.95rem" }}>
            {contentSections.find((section) => section.id === activeSection)?.caption}
          </div>
        </div>

        {renderSection()}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button type="button" style={buttonStyle("ghost")}>
            Preview
          </button>
          <button type="button" style={buttonStyle("primary")}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
