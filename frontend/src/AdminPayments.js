import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/payments/all`);
      setPayments(res.data.payments || []);
      setTransactions(res.data.transactions || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin payments", err);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/payments/update/${paymentId}`, { status: newStatus });
      alert(`Payment status updated to ${newStatus}!`);
      fetchPayments();
    } catch (err) {
      alert("Error updating status");
    }
  };

  // Compute metrics
  const paidPayments = payments.filter(p => p.paymentStatus === 'Paid');
  const pendingPayments = payments.filter(p => p.paymentStatus === 'Pending');
  const failedPayments = payments.filter(p => p.paymentStatus === 'Failed');
  const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const stats = {
    total: payments.length,
    revenue: totalRevenue,
    paid: paidPayments.length,
    pending: pendingPayments.length,
    failed: failedPayments.length
  };

  // Filter payments
  const filteredPayments = payments.filter(p => {
    // 1. Search term match
    const searchLower = searchTerm.toLowerCase();
    const patientName = p.patientId?.fullName?.toLowerCase() || "";
    const appointmentId = p.appointmentId?._id?.toLowerCase() || "";
    const txn = transactions.find(t => t.paymentId?._id === p._id);
    const txnId = txn?.transactionId?.toLowerCase() || "";
    const matchesSearch = patientName.includes(searchLower) || appointmentId.includes(searchLower) || txnId.includes(searchLower);

    // 2. Status filter match
    const matchesStatus = statusFilter === "all" || p.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Paid":
        return "badge-premium confirmed"; // Green
      case "Pending":
        return "badge-premium pending"; // Amber
      case "Failed":
        return "badge-premium cancelled"; // Red
      default:
        return "badge-premium";
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "1.1rem", fontWeight: 500 }}>
          <div style={{ fontSize: '2.5rem', animation: 'glowPulse 1.5s infinite', marginBottom: '1rem' }}>💸</div>
          Loading financial records...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>💰</span> Financial Operations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Monitor patient transactions, verify invoice statuses, and audit revenue flow</p>
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
          {showStats ? "Hide Stats" : "Show Stats"}
        </button>
      </div>

      {/* Metrics Row */}
      {showStats && (
        <div className="portal-grid-4" style={{ marginBottom: '2rem' }}>
          <div className="metric-card-premium">
            <div className="metric-info">
              <h3>Total Revenue</h3>
              <div className="number" style={{ color: 'var(--primary)' }}>৳{stats.revenue.toLocaleString()}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(37, 82, 240, 0.08)', color: 'var(--primary)' }}>📈</div>
          </div>
          <div className="metric-card-premium success">
            <div className="metric-info">
              <h3>Paid Invoices</h3>
              <div className="number">{stats.paid}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.08)', color: 'var(--success)' }}>✅</div>
          </div>
          <div className="metric-card-premium pending">
            <div className="metric-info">
              <h3>Pending Invoices</h3>
              <div className="number">{stats.pending}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(217, 119, 6, 0.08)', color: '#D97706' }}>⏳</div>
          </div>
          <div className="metric-card-premium danger">
            <div className="metric-info">
              <h3>Failed Invoices</h3>
              <div className="number">{stats.failed}</div>
            </div>
            <div className="metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)' }}>✕</div>
          </div>
        </div>
      )}

      {/* Search and Filters Glass Card */}
      <div className="glass-card" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem', padding: '20px' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Search Transactions</label>
          <input 
            type="text" 
            placeholder="Search Patient, Transaction ID, Appointment..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ margin: 0, padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}
          />
        </div>
        <div style={{ width: '200px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Payment Status</label>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="select-inline-premium"
            style={{ margin: 0, width: '100%' }}
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', fontWeight: 700 }}>No Records Match Search</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px' }}>Try adjusting your search criteria or changing the status filter.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          <table className="table-medcare">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Update Status</th>
                <th>Audit State</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => {
                const txn = transactions.find(t => t.paymentId?._id === p._id);
                
                // Helper for status pill style mapping
                const getStatusPillClass = (status) => {
                  switch (status) {
                    case "Paid": return "success";
                    case "Pending": return "warning";
                    case "Failed": return "danger";
                    default: return "";
                  }
                };

                return (
                  <tr key={p._id}>
                    <td>
                      <div className="profile-cell-medcare">
                        <div className="avatar-circle-medcare">
                          {p.patientId?.profilePhoto ? (
                            <img src={p.patientId.profilePhoto} alt="Avatar" />
                          ) : (
                            (p.patientId?.fullName || "P")[0].toUpperCase()
                          )}
                        </div>
                        <div className="stacked-info-medcare">
                          <span className="title">{p.patientId?.fullName || "Unknown"}</span>
                          <span className="subtitle">{p.patientId?.email || "No email"}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: p.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--text-heading)' }}>
                      ৳{p.amount}
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        background: 'rgba(37, 99, 235, 0.06)', 
                        color: 'var(--primary)',
                        padding: '6px 12px', 
                        borderRadius: '100px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {p.paymentMethod || "N/A"}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--text-body)', fontWeight: 500 }}>
                      {txn ? txn.transactionId : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>None</span>}
                    </td>
                    <td>
                      <select 
                        value={p.paymentStatus} 
                        onChange={e => handleUpdateStatus(p._id, e.target.value)}
                        style={{ 
                          margin: 0, 
                          padding: '6px 14px', 
                          borderRadius: '100px', 
                          border: '1.5px solid #E5E7EB',
                          fontSize: '0.82rem',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          fontWeight: 600,
                          width: 'auto',
                          color: 'var(--text-heading)',
                          outline: 'none'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-pill-medcare ${getStatusPillClass(p.paymentStatus)}`}>
                        <span className="status-dot"></span>
                        {p.paymentStatus}
                      </span>
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

export default AdminPayments;
