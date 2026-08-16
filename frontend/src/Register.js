import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from './config';

function Register({ setPage }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    // Doctor fields
    fullName: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    specialty: '',
    subSpecialty: '',
    yearsOfExperience: '',
    qualifications: '',
    medicalSchool: '',
  });
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
      await axios.post(`${API_BASE_URL}/api/auth/register`, form);
      setMessage('Registration successful! You can now log in.');
      setForm({
        email: '', password: '', confirmPassword: '', role: 'patient',
        fullName: '', phone: '', gender: '', dateOfBirth: '', specialty: '', subSpecialty: '', yearsOfExperience: '', qualifications: '', medicalSchool: ''
      });
      setTimeout(() => setPage('login'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-content">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em', margin: 0 }}>Create Account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Join our healthcare network today</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div className="input-premium-wrap" style={{ marginBottom: 0 }}>
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="input-premium"
              placeholder="email@example.com" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="input-premium-wrap" style={{ marginBottom: 0 }}>
            <label>User Type</label>
            <select 
              name="role" 
              className="input-premium"
              value={form.role} 
              onChange={handleChange}
              style={{ height: '49px' }}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div className="input-premium-wrap" style={{ marginBottom: 0 }}>
            <label>Password</label>
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
          <div className="input-premium-wrap" style={{ marginBottom: 0 }}>
            <label>Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              className="input-premium"
              placeholder="••••••••" 
              value={form.confirmPassword} 
              onChange={handleChange} 
              required={form.role === 'doctor'} 
            />
          </div>
        </div>

        {form.role === 'doctor' && (
          <div className="glass-card" style={{ marginTop: '20px', padding: '20px', background: 'rgba(37, 82, 240, 0.03)', border: '1px solid rgba(37, 82, 240, 0.1)' }}>
            <h4 style={{ marginBottom: '15px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>Professional Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-premium-wrap" style={{ marginBottom: 0 }}>
                <label>Full Name</label>
                <input type="text" name="fullName" className="input-premium" placeholder="Dr. John Doe" value={form.fullName} onChange={handleChange} required />
              </div>
              <div className="input-premium-wrap" style={{ marginBottom: 0 }}>
                <label>Phone Number</label>
                <input type="tel" name="phone" className="input-premium" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="input-premium-wrap" style={{ marginBottom: 0 }}>
                <label>Gender</label>
                <select name="gender" className="input-premium" value={form.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="input-premium-wrap" style={{ marginBottom: 0 }}>
                <label>Specialty</label>
                <input type="text" name="specialty" className="input-premium" placeholder="Cardiology" value={form.specialty} onChange={handleChange} required />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px 24px', borderRadius: '12px' }} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-body)' }}>
          Already have an account?{' '}
          <span 
            onClick={() => setPage('login')} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
          >
            Sign In
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

export default Register;
