import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

function DoctorConsultations({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/consultations/doctor/${user._id}/requests`
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching consultation requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (consultationId, action, additionalData = {}) => {
    setActionLoading({ ...actionLoading, [consultationId]: true });
    try {
      const endpoint = action === "accept" ? "accept" : "reject";
      await axios.put(
        `${API_BASE_URL}/api/consultations/${consultationId}/${endpoint}`,
        additionalData
      );
      
      setMessage(`Consultation successfully ${action}ed!`);
      setMessageType("success");
      fetchRequests();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || `Error ${action}ing consultation`);
      setMessageType("error");
    } finally {
      setActionLoading({ ...actionLoading, [consultationId]: false });
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "#ffc107",
      accepted: "#28a745",
      rejected: "#dc3545",
      completed: "#007bff",
    };

    return (
      <span style={{
        padding: "4px 12px",
        borderRadius: "20px",
        backgroundColor: statusColors[status] || "#6c757d",
        color: "white",
        fontSize: "0.8rem",
        fontWeight: "bold"
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div className="loader">Loading requests...</div>;

  return (
    <div className="fade-in-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>💻 Online Consultation Requests</h2>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Total Requests: {requests.length}
        </div>
      </div>

      {message && (
        <div className={`message ${messageType === "success" ? "message-success" : "message-error"}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3>No pending requests</h3>
          <p style={{ color: 'var(--text-muted)' }}>You're all caught up! New consultation requests will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {requests.map((request) => (
            <div key={request._id} className="glass-card" style={{ padding: '20px', borderLeft: `5px solid ${request.status === 'pending' ? '#ffc107' : '#28a745'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{request.patient.fullName}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Requested: {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>🕒 Preferred Schedule:</strong><br/>
                  {new Date(request.preferredDate).toLocaleDateString()} at {request.preferredTime}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>📑 Symptoms:</strong><br/>
                  <span style={{ fontSize: '0.9rem' }}>{request.symptoms}</span>
                </div>
                {request.medicalHistory && (
                  <div>
                    <strong>📜 History:</strong><br/>
                    <span style={{ fontSize: '0.9rem' }}>{request.medicalHistory}</span>
                  </div>
                )}
              </div>

              {request.status === "pending" && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                    onClick={() => {
                      const link = window.prompt("Enter Video Call Link (Zoom/Google Meet):", "https://meet.google.com/xyz");
                      if (link) handleAction(request._id, "accept", { consultationLink: link });
                    }}
                    disabled={actionLoading[request._id]}
                  >
                    {actionLoading[request._id] ? "Processing..." : "✅ Approve"}
                  </button>
                  <button 
                    style={{ flex: 1, padding: '10px', fontSize: '0.9rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => {
                      const reason = window.prompt("Reason for rejection:");
                      if (reason) handleAction(request._id, "reject", { rejectionReason: reason });
                    }}
                    disabled={actionLoading[request._id]}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {request.status === "accepted" && (
                <div style={{ background: 'var(--success-bg)', color: 'var(--success-text)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
                  <strong>Link Shared:</strong> <a href={request.consultationLink} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{request.consultationLink}</a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorConsultations;
