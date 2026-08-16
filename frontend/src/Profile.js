import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

function Profile({ user, onUpdate }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  
  // Doctor professional fields
  const [specialty, setSpecialty] = useState("");
  const [subSpecialty, setSubSpecialty] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [medicalSchool, setMedicalSchool] = useState("");
  
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const userId = user?._id || localStorage.getItem("userId");
  const isPatient = user?.role === "patient";
  const isDoctor = user?.role === "doctor";

  useEffect(() => {
    getProfile();
    if (isPatient) getAppointments();
    if (isDoctor) getReviews();
  }, []);

  const getProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/profile`, {
        headers: { 
          Authorization: token,
          userid: userId 
        },
      });
      const data = res.data;
      setFullName(data.fullName || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      if (data.emergencyContact) {
        setEmergencyName(data.emergencyContact.name || "");
        setEmergencyPhone(data.emergencyContact.phone || "");
        setEmergencyRelation(data.emergencyContact.relation || "");
      }
      setSpecialty(data.specialty || "");
      setSubSpecialty(data.subSpecialty || "");
      setYearsOfExperience(data.yearsOfExperience || "");
      setQualifications(data.qualifications || "");
      setMedicalSchool(data.medicalSchool || "");
    } catch (err) {
      console.log("Profile fetch error:", err);
    }
  };

  const getAppointments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/appointments/patient/${userId}`, {
        headers: { Authorization: token },
      });
      setAppointments(res.data);
    } catch (err) {
      console.log("Appointments fetch error:", err);
    }
  };

  const getReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/appointments/reviews/${userId}`, {
        headers: { Authorization: token },
      });
      setReviews(res.data || []);
    } catch (err) {
      console.log("Reviews fetch error:", err);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        fullName,
        phone,
        address,
      };

      if (isPatient) {
        payload.emergencyContact = {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation,
        };
      }

      if (isDoctor) {
        payload.specialty = specialty;
        payload.subSpecialty = subSpecialty;
        payload.yearsOfExperience = Number(yearsOfExperience) || 0;
        payload.qualifications = qualifications;
        payload.medicalSchool = medicalSchool;
      }

      const res = await axios.put(
        `${API_BASE_URL}/api/users/update/${userId}`,
        payload,
        { headers: { Authorization: token } }
      );
      
      const updatedUser = res.data.user;
      if (onUpdate) onUpdate(updatedUser);
      
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      setMessage("❌ Update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async () => {
    if (!photo) return alert("Please select a photo");
    setUploading(true);
    const formData = new FormData();
    formData.append("profilePhoto", photo);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/upload/${userId}`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });
      
      const updatedUser = { ...user, profilePhoto: res.data.profilePhoto };
      if (onUpdate) onUpdate(updatedUser);

      alert("✅ Photo uploaded successfully!");
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      alert("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fade-in-section">
      <div className="glass-card">
        <h3>👤 {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Profile</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Manage your account information and profile photo</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
          {/* Left Side: Photo */}
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: 150, 
              height: 150, 
              borderRadius: 24, 
              background: "#f1f5f9", 
              margin: "0 auto 20px", 
              overflow: "hidden",
              border: "4px solid #fff",
              boxShadow: "0 10px 20px rgba(0,0,0,0.05)"
            }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", color: "#cbd5e1" }}>
                  👤
                </div>
              )}
            </div>
            <label className="btn-ghost" style={{ cursor: "pointer", display: "inline-block", fontSize: "0.9rem" }}>
              Change Photo
              <input type="file" style={{ display: "none" }} onChange={handleFileChange} />
            </label>
            {photo && (
              <button onClick={uploadPhoto} disabled={uploading} className="btn-primary" style={{ width: "100%", marginTop: 10, padding: "8px" }}>
                {uploading ? "Uploading..." : "Save Photo"}
              </button>
            )}

            {/* Doctor Specialty Stats / Rating Badges */}
            {isDoctor && (
              <div style={{ marginTop: 25, textAlign: 'center' }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid rgba(37, 99, 235, 0.08)'
                }}>
                  <div style={{ fontSize: '1.8rem', color: '#F59E0B', fontWeight: 800 }}>
                    ⭐ {user.averageRating ? user.averageRating.toFixed(1) : "5.0"}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                    Rating ({user.totalReviews || 0} reviews)
                  </div>
                  
                  {/* Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
                    {Number(yearsOfExperience) >= 10 && (
                      <span style={{ background: '#DBEAFE', color: '#1D4ED8', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '100px', fontWeight: 700 }}>
                        🎓 Senior Expert
                      </span>
                    )}
                    {Number(yearsOfExperience) >= 5 && Number(yearsOfExperience) < 10 && (
                      <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '100px', fontWeight: 700 }}>
                        🩺 Specialist
                      </span>
                    )}
                    {(user.averageRating || 5.0) >= 4.5 && (
                      <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '100px', fontWeight: 700 }}>
                        ⭐ Top Rated
                      </span>
                    )}
                    {medicalSchool && (
                      <span style={{ background: '#F3E8FF', color: '#6B21A8', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '100px', fontWeight: 700 }}>
                        🏫 Alumnus
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Details */}
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ fontWeight: 600 }}>Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontWeight: 600 }}>Phone Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 15 }}>
              <label style={{ fontWeight: 600 }}>Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            {isPatient && (
              <div className="glass-card" style={{ marginTop: 20, background: "#f8fafc", padding: 15 }}>
                <h4 style={{ marginBottom: 10 }}>🆘 Emergency Contact</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <input placeholder="Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                  <input placeholder="Phone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
                  <input placeholder="Relation" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} style={{ gridColumn: "1 / -1" }} />
                </div>
              </div>
            )}

            {isDoctor && (
              <div className="glass-card" style={{ marginTop: 20, background: "#f8fafc", padding: 20 }}>
                <h4 style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: '8px' }}>🩺 Professional Medical Profile</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={{ fontWeight: 600 }}>Primary Specialty</label>
                    <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Cardiology" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600 }}>Sub-Specialty</label>
                    <input type="text" value={subSpecialty} onChange={(e) => setSubSpecialty(e.target.value)} placeholder="e.g. Pediatric Cardiology" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600 }}>Years of Experience</label>
                    <input type="number" min="0" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} placeholder="e.g. 12" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600 }}>Qualifications</label>
                    <input type="text" value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="e.g. MBBS, MD, FACC" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontWeight: 600 }}>Medical School / Institution</label>
                    <input type="text" value={medicalSchool} onChange={(e) => setMedicalSchool(e.target.value)} placeholder="e.g. Harvard Medical School" />
                  </div>
                </div>
              </div>
            )}

            <button onClick={updateProfile} disabled={loading} className="btn-primary" style={{ marginTop: 25, width: "100%" }}>
              {loading ? "Saving Changes..." : "Save Profile Details"}
            </button>
            {message && <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>{message}</div>}
          </div>
        </div>
      </div>

      {isPatient && appointments.length > 0 && (
        <div className="glass-card" style={{ marginTop: 30 }}>
          <h3>📅 Appointment History</h3>
          <div className="services-grid">
            {appointments.map(app => (
              <div key={app._id} className="service-card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, color: "var(--primary)" }}>Dr. {app.doctor.fullName}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{app.doctor.specialty}</div>
                <hr style={{ margin: "10px 0", border: "none", borderTop: "1px solid #eee" }} />
                <div style={{ fontSize: "0.9rem" }}>📅 {new Date(app.date).toLocaleDateString()}</div>
                <div style={{ fontSize: "0.9rem" }}>⏰ {app.timeSlot}</div>
                <div style={{ 
                  marginTop: 10, 
                  fontSize: "0.8rem", 
                  fontWeight: 700, 
                  textTransform: "uppercase",
                  color: app.status === "completed" ? "var(--accent)" : "var(--primary)"
                }}>
                  ● {app.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isDoctor && (
        <div className="glass-card" style={{ marginTop: 30 }}>
          <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>💬 Patient Reviews & Feedback</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>What your patients say about their consultations with you</p>
          
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>💬</span>
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No reviews yet</p>
              <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>When patients leave feedback on completed appointments, they will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '15px' }}>
              {reviews.map((rev) => (
                <div key={rev._id} style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid var(--glass-border-subtle)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div className="profile-cell-medcare">
                      <div className="avatar-circle-medcare" style={{ width: '30px', height: '30px', fontSize: '0.75rem' }}>
                        {(rev.patient?.fullName || "P")[0].toUpperCase()}
                      </div>
                      <div className="stacked-info-medcare">
                        <span className="title" style={{ fontSize: '0.85rem' }}>{rev.patient?.fullName || 'Patient'}</span>
                        <span className="subtitle" style={{ fontSize: '0.7rem' }}>
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.85rem' }}>
                      {'⭐'.repeat(rev.rating)}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{rev.review || 'No written comment provided.'}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;