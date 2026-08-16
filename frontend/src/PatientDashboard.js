import React, { useState, useEffect } from "react";
import axios from "axios";

function PatientDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, upcoming, completed, cancelled
  const [showStats, setShowStats] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: "" });

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/appointments/patient/${user._id}`,
      );
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setMessage("Error loading appointments");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Separate upcoming and completed appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) >= now && apt.status !== "cancelled",
  );
  const completedAppointments = appointments.filter(
    (apt) =>
      new Date(apt.date) < now ||
      apt.status === "cancelled" ||
      apt.status === "completed",
  );

  // Filter appointments based on selected status
  const getFilteredAppointments = () => {
    switch (filterStatus) {
      case "upcoming":
        return upcomingAppointments;
      case "completed":
        return completedAppointments.filter(
          (apt) => apt.status === "completed",
        );
      case "cancelled":
        return appointments.filter((apt) => apt.status === "cancelled");
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        // This would need a cancel endpoint - for now we'll show a message
        setMessage("Please contact the doctor to cancel this appointment");
        setMessageType("info");
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("Error cancelling appointment");
        setMessageType("error");
      }
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.rating || !reviewForm.review.trim()) {
      setMessage("Please provide both rating and review");
      setMessageType("error");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/appointments/review/${reviewModal._id}`,
        {
          rating: reviewForm.rating,
          review: reviewForm.review,
        },
      );
      setMessage("Review submitted successfully!");
      setMessageType("success");
      setReviewModal(null);
      setReviewForm({ rating: 5, review: "" });
      fetchAppointments();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error submitting review");
      setMessageType("error");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffc107",
      confirmed: "#28a745",
      completed: "#007bff",
      cancelled: "#dc3545",
    };
    return colors[status] || "#6c757d";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeSlot) => {
    return timeSlot;
  };

  const stats = {
    total: appointments.length,
    upcoming: upcomingAppointments.length,
    completed: completedAppointments.filter((apt) => apt.status === "completed")
      .length,
    cancelled: appointments.filter((apt) => apt.status === "cancelled").length,
  };

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
            <span>📋</span> Appointment Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Manage your consultations, schedules, and reviews</p>
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

      {message && (
        <div
          className={`message ${
            messageType === "success"
              ? "message-success"
              : messageType === "error"
                ? "message-error"
                : "message-success"
          }`}
          style={{ marginBottom: '20px' }}
        >
          {message}
        </div>
      )}

      {/* Statistics Cards */}
      {showStats && (
        <div className="portal-grid-4">
          <div className="metric-card-premium">
            <div className="metric-info">
              <h3>Total Appointments</h3>
              <div className="number">{stats.total}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(37, 82, 240, 0.08)', color: 'var(--primary)' }}>📊</div>
          </div>
          <div className="metric-card-premium success">
            <div className="metric-info">
              <h3>Upcoming Visits</h3>
              <div className="number">{stats.upcoming}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.08)', color: 'var(--success)' }}>📅</div>
          </div>
          <div className="metric-card-premium accent">
            <div className="metric-info">
              <h3>Completed Visits</h3>
              <div className="number">{stats.completed}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(205, 120, 52, 0.08)', color: 'var(--accent)' }}>✅</div>
          </div>
          <div className="metric-card-premium danger">
            <div className="metric-info">
              <h3>Cancelled Visits</h3>
              <div className="number">{stats.cancelled}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)' }}>❌</div>
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
          onClick={() => setFilterStatus("upcoming")}
          className={`filter-tab-btn ${filterStatus === "upcoming" ? "active color-success" : ""}`}
        >
          Upcoming ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setFilterStatus("completed")}
          className={`filter-tab-btn ${filterStatus === "completed" ? "active color-purple" : ""}`}
        >
          Completed ({completedAppointments.filter((apt) => apt.status === "completed").length})
        </button>
        <button
          onClick={() => setFilterStatus("cancelled")}
          className={`filter-tab-btn ${filterStatus === "cancelled" ? "active color-danger" : ""}`}
        >
          Cancelled ({appointments.filter((apt) => apt.status === "cancelled").length})
        </button>
      </div>

      {/* Appointments Rows Table */}
      {filteredAppointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-white)', borderRadius: '16px', border: '1.5px dashed var(--glass-border-subtle)' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>📅</span>
          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", fontWeight: 500 }}>
            {filterStatus === "all"
              ? "No appointments scheduled yet."
              : `No ${filterStatus} appointments found.`}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          <table className="table-medcare">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appointment => {
                const appointmentDate = new Date(appointment.date);
                const isUpcoming = appointmentDate >= now;

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
                  <tr key={appointment._id}>
                    <td>
                      <div className="profile-cell-medcare">
                        <div className="avatar-circle-medcare">
                          {appointment.doctor?.profilePhoto ? (
                            <img src={appointment.doctor.profilePhoto} alt="Doctor" />
                          ) : (
                            (appointment.doctor?.fullName || "D")[0].toUpperCase()
                          )}
                        </div>
                        <div className="stacked-info-medcare">
                          <span className="title">Dr. {appointment.doctor?.fullName || 'Unknown Doctor'}</span>
                          <span className="subtitle">{appointment.doctor?.specialty || 'General Practitioner'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      {formatDate(appointment.date)}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-body)' }}>
                      {formatTime(appointment.timeSlot)}
                    </td>
                    <td>
                      <span className={`status-pill-medcare ${getStatusPillClass(appointment.status)}`}>
                        <span className="status-dot"></span>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isUpcoming && appointment.status === "confirmed" && (
                          <button
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="action-btn-circle-medcare danger"
                            title="Cancel Appointment"
                            style={{ border: '1.5px solid var(--danger)', color: 'var(--danger)' }}
                          >
                            ❌
                          </button>
                        )}

                        {appointment.status === "completed" && !appointment.review && (
                          <button
                            onClick={() => {
                              setReviewModal(appointment);
                              setReviewForm({ rating: 5, review: "" });
                            }}
                            className="btn-primary"
                            style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem' }}
                          >
                            Leave Review
                          </button>
                        )}

                        {appointment.status === "completed" && appointment.review && (
                          <button
                            onClick={() => {
                              setReviewModal(appointment);
                            }}
                            className="btn-ghost"
                            style={{ 
                              padding: '6px 14px', 
                              borderRadius: '100px', 
                              fontSize: '0.8rem', 
                              border: '1.5px solid #E5E7EB',
                              background: '#FFFFFF',
                              color: 'var(--text-heading)',
                              height: 'auto',
                              width: 'auto'
                            }}
                          >
                            ⭐ {appointment.rating} (View)
                          </button>
                        )}

                        {appointment.status === "cancelled" && (
                          <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 600 }}>
                            Cancelled
                          </span>
                        )}
                        
                        {appointment.status === "pending" && (
                          <span style={{ fontSize: '0.82rem', color: 'var(--warning)', fontWeight: 600 }}>
                            Awaiting Approval
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

      {/* Review Modal Overhaul */}
      {reviewModal && (
        <div className="modal-overlay-premium" onClick={() => setReviewModal(null)}>
          <div className="modal-premium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                {reviewModal.review ? "Review Receipt" : "Submit Consultation Feedback"}
              </h2>
              <button
                onClick={() => setReviewModal(null)}
                style={{ fontSize: "1.8rem", border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                ×
              </button>
            </div>

            <div className="modal-content-premium">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', background: 'rgba(37, 82, 240, 0.04)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem' }}>🏥</div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Dr. {reviewModal.doctor.fullName}</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(reviewModal.date)} • {reviewModal.timeSlot}</p>
                </div>
              </div>

              {!reviewModal.review ? (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: '8px' }}>
                      Rating <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() =>
                            setReviewForm({ ...reviewForm, rating: num })
                          }
                          type="button"
                          style={{
                            fontSize: "2.2rem",
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            opacity: num <= reviewForm.rating ? 1 : 0.22,
                            transform: num <= reviewForm.rating ? 'scale(1.05)' : 'scale(1)',
                            transition: "all 0.2s ease",
                            padding: 0
                          }}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: '8px' }}>
                      Your Review <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <textarea
                      value={reviewForm.review}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, review: e.target.value })
                      }
                      className="input-premium"
                      placeholder="Share details of your consultation experience with the doctor..."
                      rows="4"
                      style={{ resize: "vertical", fontFamily: 'var(--font)', padding: '12px' }}
                      maxLength="500"
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <small style={{ color: "var(--text-muted)", fontSize: '0.78rem' }}>
                        {reviewForm.review.length}/500 characters
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => setReviewModal(null)}
                      className="btn-ghost"
                      style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReviewSubmit}
                      className="btn-primary"
                      style={{ flex: 1, padding: '12px', borderRadius: '12px' }}
                    >
                      Submit Review
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>Rating Given</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: "1.4rem", marginTop: '4px' }}>
                      {"⭐".repeat(reviewModal.rating)}
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', marginLeft: '6px' }}>({reviewModal.rating} / 5)</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>Your Feedback</label>
                    <p
                      style={{
                        marginTop: "8px",
                        fontStyle: "italic",
                        lineHeight: "1.6",
                        background: 'rgba(0,0,0,0.02)',
                        padding: '16px',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--accent)',
                        color: 'var(--text-body)'
                      }}
                    >
                      "{reviewModal.review}"
                    </p>
                  </div>

                  <button
                    onClick={() => setReviewModal(null)}
                    className="btn-primary"
                    style={{ width: "100%", padding: '12px', borderRadius: '12px' }}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
