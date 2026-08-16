import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DoctorDashboard({ user, setPage }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    const doctorId = user?._id || user?.id || user?.userId;
    if (!doctorId) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/appointments/doctor/${doctorId}`);
      setAppointments(res.data || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  // Get today's appointments
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => {
    const aDate = new Date(a.date).toISOString().split('T')[0];
    return aDate === todayStr && (a.status === 'confirmed' || a.status === 'pending');
  });

  // Get upcoming (next 7 days)
  const next7 = new Date(today);
  next7.setDate(next7.getDate() + 7);
  const upcomingAppointments = appointments.filter(a => {
    const d = new Date(a.date);
    return d >= today && d <= next7 && (a.status === 'confirmed' || a.status === 'pending');
  }).slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (slot) => slot || 'TBD';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "1.1rem", fontWeight: 500 }}>
          <div style={{ fontSize: '2.5rem', animation: 'glowPulse 1.5s infinite', marginBottom: '1rem' }}>🩺</div>
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-dash-welcome">
      {/* Hero Banner */}
      <div className="doctor-dash-hero">
        <div className="doctor-dash-hero-text">
          <h1>{getGreeting()}, Dr. {user?.fullName?.split(' ').pop() || 'Doctor'}! 👋</h1>
          <p>
            You have <strong>{todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''}</strong> scheduled today
            and <strong>{stats.pending} pending request{stats.pending !== 1 ? 's' : ''}</strong> awaiting confirmation.
          </p>
        </div>
        <div className="doctor-dash-hero-emoji">🩺</div>
      </div>

      {/* Stat Metrics */}
      <div className="portal-grid-4" style={{ marginBottom: '2rem' }}>
        <div className="metric-card-premium" onClick={() => setPage('appointments')} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <h3>Total Patients</h3>
            <div className="number">{stats.total}</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'rgba(37, 82, 240, 0.08)', color: 'var(--primary)' }}>📊</div>
        </div>
        <div className="metric-card-premium pending" onClick={() => setPage('appointments')} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <h3>Pending Requests</h3>
            <div className="number">{stats.pending}</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'rgba(217, 119, 6, 0.08)', color: '#D97706' }}>⏳</div>
        </div>
        <div className="metric-card-premium success" onClick={() => setPage('appointments')} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <h3>Confirmed Today</h3>
            <div className="number">{stats.confirmed}</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.08)', color: 'var(--success)' }}>✅</div>
        </div>
        <div className="metric-card-premium purple" onClick={() => setPage('appointments')} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <h3>Completed</h3>
            <div className="number">{stats.completed}</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.08)', color: 'var(--purple)' }}>🏆</div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="doctor-dash-quick-grid">
        <div className="doctor-quick-card" onClick={() => setPage('appointments')} style={{ animationDelay: '0.1s' }}>
          <div className="doctor-quick-icon" style={{ background: 'rgba(37, 99, 235, 0.08)' }}>📅</div>
          <h4>Appointments</h4>
          <p>View and manage all your patient appointments, confirm or cancel bookings</p>
        </div>
        <div className="doctor-quick-card" onClick={() => setPage('med-history')} style={{ animationDelay: '0.2s' }}>
          <div className="doctor-quick-icon" style={{ background: 'rgba(22, 163, 74, 0.08)' }}>📋</div>
          <h4>Patient History</h4>
          <p>Access complete patient medical records, diagnoses, and treatment history</p>
        </div>
        <div className="doctor-quick-card" onClick={() => setPage('consultations')} style={{ animationDelay: '0.3s' }}>
          <div className="doctor-quick-icon" style={{ background: 'rgba(139, 92, 246, 0.08)' }}>💻</div>
          <h4>Online Consults</h4>
          <p>Start or join virtual consultations with patients from anywhere</p>
        </div>
        <div className="doctor-quick-card" onClick={() => setPage('prescriptions')} style={{ animationDelay: '0.4s' }}>
          <div className="doctor-quick-icon" style={{ background: 'rgba(217, 119, 6, 0.08)' }}>💊</div>
          <h4>Prescriptions</h4>
          <p>Write, manage, and track patient prescriptions and medications</p>
        </div>
      </div>

      {/* Bottom Grid — Schedule + Tips */}
      <div className="doctor-dash-bottom-grid">
        {/* Today's Schedule */}
        <div className="doctor-schedule-card">
          <h3>📅 Upcoming Schedule</h3>
          {upcomingAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🗓️</div>
              <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>No upcoming appointments</p>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Your schedule is clear for the next 7 days</p>
            </div>
          ) : (
            upcomingAppointments.map((apt, idx) => (
              <div className="schedule-slot-item" key={apt._id || idx}>
                <div className="schedule-time-badge">{formatTime(apt.timeSlot)}</div>
                <div className="schedule-slot-info">
                  <span className="title">{apt.patient?.fullName || 'Patient'}</span>
                  <span className="subtitle">
                    {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}
                    <span style={{ 
                      color: apt.status === 'confirmed' ? 'var(--success)' : '#D97706',
                      fontWeight: 600
                    }}>
                      {apt.status}
                    </span>
                  </span>
                </div>
                <span className={`status-pill-medcare ${apt.status === 'confirmed' ? 'primary' : 'warning'}`}>
                  <span className="status-dot"></span>
                  {apt.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Quick Tips */}
        <div className="doctor-tips-card">
          <h3>💡 Quick Tips & Actions</h3>

          <div className="tip-item" onClick={() => setPage('profile')} style={{ cursor: 'pointer' }}>
            <div className="tip-icon" style={{ background: 'rgba(37, 99, 235, 0.08)' }}>👤</div>
            <div>
              <h5>Update Your Profile</h5>
              <p>Keep your professional info current for patients to find you easily</p>
            </div>
          </div>

          <div className="tip-item" onClick={() => setPage('consultations')} style={{ cursor: 'pointer' }}>
            <div className="tip-icon" style={{ background: 'rgba(22, 163, 74, 0.08)' }}>🎥</div>
            <div>
              <h5>Virtual Consultations</h5>
              <p>Start online video consults to reach patients remotely</p>
            </div>
          </div>

          <div className="tip-item" onClick={() => setPage('prescriptions')} style={{ cursor: 'pointer' }}>
            <div className="tip-icon" style={{ background: 'rgba(139, 92, 246, 0.08)' }}>📝</div>
            <div>
              <h5>Digital Prescriptions</h5>
              <p>Write and send prescriptions directly to patient accounts</p>
            </div>
          </div>

          <div className="tip-item" onClick={() => setPage('med-history')} style={{ cursor: 'pointer' }}>
            <div className="tip-icon" style={{ background: 'rgba(217, 119, 6, 0.08)' }}>🔍</div>
            <div>
              <h5>Patient Records</h5>
              <p>Review complete medical histories before consultations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
