import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Menu from "./pages/Menu";

const AdminSignIn = lazy(() => import("./pages/AdminSignIn"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ReservationsManagement = lazy(() => import("./pages/admin/ReservationsManagement"));
const Management = lazy(() => import("./pages/admin/Management"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Messages = lazy(() => import("./pages/admin/Messages"));

const PageLoader = () => (
  <div
    style={{
      minHeight: "50vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Montserrat, sans-serif",
      fontSize: "1rem",
      letterSpacing: "0.08em",
    }}
  >
    Loading…
  </div>
);

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return null;
}

function PrivateAdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("adminToken");

  if (!token) {
    console.warn("Status: Unauthorized. Redirecting to admin login.");
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <ScrollToTop />
        <Routes>
          {/* Admin Sign In route without Layout (no header/footer) */}
          <Route path="/admin" element={<AdminSignIn />} />

          {/* Admin routes with persistent layout */}
          <Route
            path="/admin/*"
            element={(
              <PrivateAdminRoute>
                <AdminLayout />
              </PrivateAdminRoute>
            )}
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="reservations" element={<ReservationsManagement />} />
            <Route path="management" element={<Management />} />
            <Route path="settings" element={<Settings />} />
            <Route path="messages" element={<Messages />} />
          </Route>

          {/* Regular routes with Layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/menu" element={<Layout><Menu /></Layout>} />
        </Routes>
      </Suspense>
    </Router>
  );
}
