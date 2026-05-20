import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import ReservationPopup from "./ReservationPopup";

export default function Layout({ children }) {
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", background: "#f8f8f8", minHeight: "100vh" }}>
      <Header onReserveClick={() => setIsReservationOpen(true)} />
      <main>{children}</main>
      <Footer />
      <BackToTop />
      <ReservationPopup
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />
    </div>
  );
}

