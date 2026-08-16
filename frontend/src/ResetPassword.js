import React, { useState } from "react";
import axios from "axios";

function ResetPassword({ setPage }) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setMessage("❌ Passwords do not match");
    }
    setLoading(true);
    setMessage("");
    try {
      await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setMessage("✅ Password reset successful! Redirecting to login...");
      setTimeout(() => setPage("login"), 2000);
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.message || "Invalid or expired token"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-content">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔄</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em', margin: 0 }}>Reset Password</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Enter your reset token and new password
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-premium-wrap">
          <label>Reset Token</label>
          <input
            type="text"
            className="input-premium"
            placeholder="Paste token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        <div className="input-premium-wrap">
          <label>New Password</label>
          <input
            type="password"
            className="input-premium"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-premium-wrap" style={{ marginBottom: '2rem' }}>
          <label>Confirm Password</label>
          <input
            type="password"
            className="input-premium"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px 24px', borderRadius: '12px' }} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span 
            onClick={() => setPage('login')} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
          >
            ← Back to Login
          </span>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`} style={{ marginTop: '1.5rem' }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default ResetPassword;