import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from './config';

function Login({ setUser, setPage }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        form
      );

      // Save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);

      // Save user
      setUser(res.data.user);
      setMessage('Login successful!');
      setForm({ email: '', password: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-content">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏥</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Please enter your credentials to access your account</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="input-premium-wrap">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            className="input-premium"
            placeholder="name@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-premium-wrap" style={{ marginBottom: '1.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ margin: 0 }}>Password</label>
            <span 
              onClick={() => setPage('forgot')} 
              style={{ fontSize: '0.82rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Forgot Password?
            </span>
          </div>
          <input
            type="password"
            name="password"
            className="input-premium"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px 24px', borderRadius: '12px' }} disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-body)' }}>
          Don't have an account?{' '}
          <span 
            onClick={() => setPage('register')} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
          >
            Sign Up
          </span>
        </div>

        {message && (
          <div className={`message ${message.includes('successful') ? 'message-success' : 'message-error'}`} style={{ marginTop: '1.5rem' }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;