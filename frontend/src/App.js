import React, { useState, useEffect } from "react";
import Register from "./Register";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import BookAppointment from "./BookAppointment";
import DoctorAppointments from "./DoctorAppointments";
import DoctorSearch from "./Doctorsearch";
import Profile from "./Profile";
import OnlineConsultation from "./OnlineConsultation";
import PatientDashboard from "./PatientDashboard";
import PatientPayments from "./PatientPayments";
import AdminPayments from "./AdminPayments";
import DoctorPrescriptions from "./DoctorPrescriptions";
import PatientPrescriptions from "./PatientPrescriptions";
import PatientMedicalHistory from "./PatientMedicalHistory";
import DoctorMedicalHistory from "./DoctorMedicalHistory";
import DoctorDashboard from "./DoctorDashboard";
import MedicineCatalog from "./MedicineCatalog";
import LandingPage from "./LandingPage";
import ChangePassword from "./ChangePassword";
import DoctorConsultations from "./DoctorConsultations";
import "./styles.css";

function App() {
  const [page, setPage] = useState(() => localStorage.getItem("currentPage") || "landing");
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("Local storage parse error:", err);
      return null;
    }
  });

  const hospitalName = "PrimaCure";

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("currentPage", page);
  }, [page]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    setPage("landing");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentPage");
  };

  // Helper to render role-based sidebar items
  const renderSidebarItems = () => {
    if (!user) return null;

    if (user.role === "patient") {
      return (
        <>
          <div className="sidebar-heading">Menu</div>
          <div className={`nav-item ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>🏠 Dashboard</div>
          <div className={`nav-item ${page === "medical-history" ? "active" : ""}`} onClick={() => setPage("medical-history")}>📋 Medical History</div>
          <div className={`nav-item ${page === "search" ? "active" : ""}`} onClick={() => setPage("search")}>🔍 Search Doctors</div>
          <div className={`nav-item ${page === "appointment" ? "active" : ""}`} onClick={() => setPage("appointment")}>📅 Book Appointment</div>
          <div className={`nav-item ${page === "consultation" ? "active" : ""}`} onClick={() => setPage("consultation")}>💻 Online Consultation</div>
          <div className={`nav-item ${page === "prescriptions" ? "active" : ""}`} onClick={() => setPage("prescriptions")}>💊 Prescriptions</div>
          <div className={`nav-item ${page === "payments" ? "active" : ""}`} onClick={() => setPage("payments")}>💳 Payments</div>
          
          <div className="sidebar-heading">Other Menu</div>
          <div className={`nav-item ${page === "profile" ? "active" : ""}`} onClick={() => setPage("profile")}>👤 Profile</div>
          <div className={`nav-item ${page === "change-password" ? "active" : ""}`} onClick={() => setPage("change-password")}>🔒 Security</div>
        </>
      );
    }

    if (user.role === "doctor") {
      return (
        <>
          <div className="sidebar-heading">Menu</div>
          <div className={`nav-item ${page === "doctor-dashboard" ? "active" : ""}`} onClick={() => setPage("doctor-dashboard")}>🏠 Dashboard</div>
          <div className={`nav-item ${page === "appointments" ? "active" : ""}`} onClick={() => setPage("appointments")}>📅 Appointments</div>
          <div className={`nav-item ${page === "med-history" ? "active" : ""}`} onClick={() => setPage("med-history")}>📋 Patient History</div>
          <div className={`nav-item ${page === "consultations" ? "active" : ""}`} onClick={() => setPage("consultations")}>💻 Online Consultations</div>
          <div className={`nav-item ${page === "prescriptions" ? "active" : ""}`} onClick={() => setPage("prescriptions")}>💊 Prescriptions</div>

          <div className="sidebar-heading">Other Menu</div>
          <div className={`nav-item ${page === "profile" ? "active" : ""}`} onClick={() => setPage("profile")}>👤 Profile</div>
          <div className={`nav-item ${page === "change-password" ? "active" : ""}`} onClick={() => setPage("change-password")}>🔒 Security</div>
        </>
      );
    }

    if (user.role === "admin") {
      return (
        <>
          <div className="sidebar-heading">Menu</div>
          <div className={`nav-item ${page === "admin-payments" ? "active" : ""}`} onClick={() => setPage("admin-payments")}>💰 Payments</div>
          <div className={`nav-item ${page === "catalog" ? "active" : ""}`} onClick={() => setPage("catalog")}>📦 Medicine Catalog</div>

          <div className="sidebar-heading">Other Menu</div>
          <div className={`nav-item ${page === "profile" ? "active" : ""}`} onClick={() => setPage("profile")}>👤 Profile</div>
          <div className={`nav-item ${page === "change-password" ? "active" : ""}`} onClick={() => setPage("change-password")}>🔒 Security</div>
        </>
      );
    }
  };

  return (
    <div className={`layout-container${!user ? ' no-sidebar' : ''}`}>
      {/* --- Sidebar (only for logged in) --- */}
      {user && (
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">🏥</span>
            <span style={{ fontWeight: 800 }}>{hospitalName}</span>
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {renderSidebarItems()}
            <div className="nav-item" onClick={logout} style={{ marginTop: "auto", color: "#EF4444" }}>
              🚪 Logout
            </div>
          </nav>
        </aside>
      )}

      {/* --- Main Section --- */}
      <div className="main-wrap" style={{ flex: 1, width: "100%" }}>
        {/* --- Navbar (hidden on landing page, shown elsewhere) --- */}
        {!(page === "landing" && !user) && (
          <header className="navbar">
            {!user ? (
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginLeft: "auto" }}>
                <div style={{ marginRight: "20px", fontWeight: 600, cursor: "pointer", color: page === "landing" ? "var(--primary)" : "var(--text-main)" }} onClick={() => setPage("landing")}>
                  Home
                </div>
                <button className={`btn-ghost ${page === "login" ? "active" : ""}`} onClick={() => setPage("login")}>Login</button>
                <button className="btn-primary" onClick={() => setPage("register")}>Get Started</button>
              </div>
            ) : (
              <>
                {/* Search Bar on Left of Navbar */}
                <div className="search-pill-medcare">
                  <span className="search-icon">🔍</span>
                  <input type="text" placeholder="Search..." />
                </div>

                {/* Right Topbar Panel */}
                <div className="topbar-right-panel">
                  <div className="topbar-icon-btn">☀️</div>
                  <div className="topbar-icon-btn">💬</div>
                  <div className="topbar-icon-btn">🔔</div>
                  
                  <div className="profile-pill-medcare" onClick={() => setPage("profile")}>
                    <div className="avatar-circle-medcare" style={{ width: 34, height: 34 }}>
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="Profile" />
                      ) : (
                        (user.fullName || user.email || "U")[0].toUpperCase()
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-heading)", lineHeight: 1.2 }}>
                        {user.fullName?.split(" ")[0] || user.email?.split("@")[0]}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "capitalize", lineHeight: 1.2 }}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="topbar-icon-btn" onClick={() => setPage("change-password")}>⚙️</div>
                </div>
              </>
            )}
          </header>
        )}

        {/* --- Dynamic Content Area --- */}
        <main className={user ? "main-content" : (page === "landing" ? "landing-wrapper" : "auth-wrapper")}>
          {!user ? (
            <>
              {page === "landing" && <LandingPage setPage={setPage} />}
              {(page === "login" || page === "register" || page === "forgot" || page === "reset") && (
                <div className="auth-card-premium">
                  {page === "login" && <Login setPage={setPage} setUser={(u) => { setUser(u); setPage(u.role === 'admin' ? 'admin-payments' : u.role === 'doctor' ? 'doctor-dashboard' : 'dashboard'); }} />}
                  {page === "register" && <Register setPage={setPage} />}
                  {page === "forgot" && <ForgotPassword setPage={setPage} />}
                  {page === "reset" && <ResetPassword setPage={setPage} />}
                </div>
              )}
            </>
          ) : (
            <div className="fade-in-section">
              {/* Patient Views */}
              {user.role === "patient" && (
                <>
                  {page === "profile" && <Profile user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />}
                  {page === "medical-history" && <PatientMedicalHistory user={user} />}
                  {page === "dashboard" && <PatientDashboard user={user} />}
                  {page === "search" && <DoctorSearch />}
                  {page === "appointment" && <BookAppointment user={user} />}
                  {page === "consultation" && <OnlineConsultation user={user} />}
                  {page === "prescriptions" && <PatientPrescriptions user={user} />}
                  {page === "payments" && <PatientPayments user={user} />}
                  {page === "change-password" && <ChangePassword user={user} />}
                </>
              )}

              {/* Doctor Views */}
              {user.role === "doctor" && (
                <>
                  {page === "doctor-dashboard" && <DoctorDashboard user={user} setPage={setPage} />}
                  {page === "profile" && <Profile user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />}
                  {page === "med-history" && <DoctorMedicalHistory user={user} />}
                  {page === "appointments" && <DoctorAppointments user={user} />}
                  {page === "consultations" && <DoctorConsultations user={user} />}
                  {page === "prescriptions" && <DoctorPrescriptions user={user} />}
                  {page === "change-password" && <ChangePassword user={user} />}
                </>
              )}

              {/* Admin Views */}
              {user.role === "admin" && (
                <>
                  {page === "profile" && <Profile user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />}
                  {page === "admin-payments" && <AdminPayments />}
                  {page === "catalog" && <MedicineCatalog />}
                  {page === "change-password" && <ChangePassword user={user} />}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
