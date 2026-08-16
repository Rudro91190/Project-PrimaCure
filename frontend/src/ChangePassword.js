import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

function ChangePassword({ user }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage("❌ New passwords do not match");
    }
    setLoading(true);
    setMessage("");
    try {
      await axios.put(`${API_BASE_URL}/api/auth/change-password`, {
        userId: user._id,
        currentPassword,
        newPassword,
      });
      setMessage("✅ Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.message || "Failed to update password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in-section" style={{ maxWidth: '500px', margin: '20px auto' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.4rem' }}>🔒</span> Change Password
      </h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Update your account security details</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 600 }}>Current Password</label>
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 600 }}>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ fontWeight: 600 }}>Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>

        {message && (
          <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`} style={{ marginTop: '1.5rem' }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default ChangePassword;
