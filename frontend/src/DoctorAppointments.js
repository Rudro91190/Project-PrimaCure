import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './config';

function DoctorAppointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    const doctorId = user?._id || user?.id || user?.userId;
    if (!doctorId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`${API_BASE_URL}/api/appointments/doctor/${doctorId}`);
      setAppointments(res.data || []);
    } catch (err) {
      setAppointments([]);
      setError('Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const completeAppointment = async (appointmentId) => {
    if (window.confirm("Mark this appointment as completed?")) {
      try {
        await axios.put(`${API_BASE_URL}/api/appointments/complete/${appointmentId}`);
        fetchAppointments(); // Refresh list
      } catch (err) {
        alert('Error completing appointment');
      }
    }
  };

  const confirmAppointment = async (appointmentId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/confirm/${appointmentId}`);
      fetchAppointments(); // Refresh list
    } catch (err) {
      alert('Error confirming appointment');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await axios.put(`${API_BASE_URL}/api/appointments/cancel/${appointmentId}`);
        fetchAppointments(); // Refresh list
      } catch (err) {
        alert('Error cancelling appointment');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Compute stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(app => app.status === 'pending').length,
    confirmed: appointments.filter(app => app.status === 'confirmed').length,
    completed: appointments.filter(app => app.status === 'completed').length,
    cancelled: appointments.filter(app => app.status === 'cancelled').length,
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "1.1rem", fontWeight: 500 }}>
          <div style={{ fontSize: '2.5rem', animation: 'glowPulse 1.5s infinite', marginBottom: '1rem' }}>🏥</div>
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>📅</span> Appointment Manager
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Review scheduling requests, confirm appointments, and track patient consults</p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="btn-primary"
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: showStats ? 'var(--primary-gradient)' : 'rgba(0,0,0,0.06)',
            color: showStats ? '#fff' : 'var(--text-heading)',
            boxShadow: showStats ? '0 4px 15px rgba(37, 82, 240, 0.2)' : 'none',
            border: showStats ? 'none' : '1px solid rgba(0,0,0,0.08)'
          }}
        >
          {showStats ? "Hide Overview" : "Show Overview"}
        </button>
      </div>

      {error && (
        <div className="message message-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      {showStats && (
        <div className="portal-grid-4" style={{ marginBottom: '2rem' }}>
          <div className="metric-card-premium">
            <div className="metric-info">
              <h3>Total Appointments</h3>
              <div className="number">{stats.total}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(37, 82, 240, 0.08)', color: 'var(--primary)' }}>📊</div>
          </div>
          <div className="metric-card-premium pending">
            <div className="metric-info">
              <h3>Pending Requests</h3>
              <div className="number">{stats.pending}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(217, 119, 6, 0.08)', color: '#D97706' }}>⏳</div>
          </div>
          <div className="metric-card-premium success">
            <div className="metric-info">
              <h3>Confirmed Visits</h3>
              <div className="number">{stats.confirmed}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.08)', color: 'var(--success)' }}>📅</div>
          </div>
          <div className="metric-card-premium purple">
            <div className="metric-info">
              <h3>Completed Consults</h3>
              <div className="number">{stats.completed}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.08)', color: 'var(--purple)' }}>✅</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs-premium">
        <button
          onClick={() => setFilterStatus("all")}
          className={`filter-tab-btn ${filterStatus === "all" ? "active" : ""}`}
        >
          All ({appointments.length})
        </button>
        <button
          onClick={() => setFilterStatus("pending")}
          className={`filter-tab-btn ${filterStatus === "pending" ? "active color-warning" : ""}`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilterStatus("confirmed")}
          className={`filter-tab-btn ${filterStatus === "confirmed" ? "active color-success" : ""}`}
        >
          Confirmed ({stats.confirmed})
        </button>
        <button
          onClick={() => setFilterStatus("completed")}
          className={`filter-tab-btn ${filterStatus === "completed" ? "active color-purple" : ""}`}
        >
          Completed ({stats.completed})
        </button>
        <button
          onClick={() => setFilterStatus("cancelled")}
          className={`filter-tab-btn ${filterStatus === "cancelled" ? "active color-danger" : ""}`}
        >
          Cancelled ({stats.cancelled})
        </button>
      </div>

      {/* Appointment Rows Table */}
      {filteredAppointments.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', fontWeight: 700 }}>No Appointments Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px' }}>There are no appointments matching the selected filter.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          <table className="table-medcare">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(app => {
                // Map status to pill colors
                const getStatusPillClass = (status) => {
                  switch (status) {
                    case "confirmed":
                      return "primary";
                    case "completed":
                      return "success";
                    case "pending":
                      return "warning";
                    case "cancelled":
                      return "danger";
                    default:
                      return "primary";
                  }
                };

                return (
                  <tr key={app._id}>
                    <td>
                      <div className="profile-cell-medcare">
                        <div className="avatar-circle-medcare">
                          {app.patient?.profilePhoto ? (
                            <img src={app.patient.profilePhoto} alt="Avatar" />
                          ) : (
                            (app.patient?.fullName || "P")[0].toUpperCase()
                          )}
                        </div>
                        <div className="stacked-info-medcare">
                          <span className="title">{app.patient?.fullName || 'Unknown Patient'}</span>
                          <span className="subtitle">{app.patient?.email || 'No email registered'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      {formatDate(app.date)}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-body)' }}>
                      {app.timeSlot || 'Not Specified'}
                    </td>
                    <td>
                      <span className={`status-pill-medcare ${getStatusPillClass(app.status)}`}>
                        <span className="status-dot"></span>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {app.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => confirmAppointment(app._id)}
                              className="action-btn-circle-medcare"
                              title="Confirm Appointment"
                              style={{ border: '1.5px solid var(--success)', color: 'var(--success)' }}
                            >
                              ✔️
                            </button>
                            <button 
                              onClick={() => cancelAppointment(app._id)}
                              className="action-btn-circle-medcare danger"
                              title="Cancel Appointment"
                              style={{ border: '1.5px solid var(--danger)', color: 'var(--danger)' }}
                            >
                              ❌
                            </button>
                          </>
                        )}
                        {app.status === 'confirmed' && (
                          <>
                            <button 
                              onClick={() => completeAppointment(app._id)}
                              className="action-btn-circle-medcare"
                              title="Complete Appointment"
                              style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)' }}
                            >
                              ✔️
                            </button>
                            <button 
                              onClick={() => cancelAppointment(app._id)}
                              className="action-btn-circle-medcare danger"
                              title="Cancel Appointment"
                              style={{ border: '1.5px solid var(--danger)', color: 'var(--danger)' }}
                            >
                              ❌
                            </button>
                          </>
                        )}
                        {app.status === 'completed' && (
                          <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600, background: 'var(--success-bg)', padding: '4px 10px', borderRadius: '100px' }}>
                            Completed
                          </span>
                        )}
                        {app.status === 'cancelled' && (
                          <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 600, background: 'var(--danger-bg)', padding: '4px 10px', borderRadius: '100px' }}>
                            Cancelled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;
