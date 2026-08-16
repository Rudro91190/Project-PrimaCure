import React, { useState } from "react";
import axios from "axios";

function ForgotPassword({ setPage }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage("✅ Reset link sent! Check your email (or use the token provided in demo).");
      console.log("Reset Token (for demo):", res.data.token);
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-content">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em', margin: 0 }}>Forgot Password?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Enter your email to receive a password reset link
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-premium-wrap" style={{ marginBottom: '2rem' }}>
          <label>Email Address</label>
          <input
            type="email"
            className="input-premium"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px 24px', borderRadius: '12px' }} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;