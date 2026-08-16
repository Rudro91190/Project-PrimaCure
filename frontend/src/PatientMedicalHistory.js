import React, { useState, useEffect } from "react";
import axios from "axios";

function PatientMedicalHistory({ user }) {
  const [history, setHistory] = useState([]);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [histRes, repRes, apptRes, presRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/medical-history/patient/${user._id}`),
        axios.get(`http://localhost:5000/api/reports/patient/${user._id}`),
        axios.get(`http://localhost:5000/api/appointments/patient/${user._id}`),
        axios.get(`http://localhost:5000/api/prescriptions/patient/${user._id}`)
      ]);
      setHistory(histRes.data || []);
      setReports(repRes.data || []);
      setAppointments(apptRes.data || []);
      setPrescriptions(presRes.data.prescriptions || []);
    } catch (err) {
      console.error("Error fetching medical timeline", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading Medical History...</p>;

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h2 style={{ color: "#007bff", borderBottom: "2px solid #007bff", paddingBottom: 10 }}>My Medical History</h2>
      
      {/* Patient Profile Snapshot */}
      <div style={{ background: "#f8f9fa", padding: 15, borderRadius: 8, marginBottom: 20, border: "1px solid #dee2e6" }}>
        <h4>Profile Details</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Phone:</strong> {user.phone || "N/A"}</p>
          <p><strong>Age:</strong> {user.age || "N/A"}</p>
          <p><strong>Gender:</strong> {user.gender || "N/A"}</p>
          <p><strong>Blood Group:</strong> {user.bloodGroup || "N/A"}</p>
          <p><strong>Address:</strong> {user.address || "N/A"}</p>
        </div>
      </div>

      {/* Medical History Records */}
      <h4 style={{ background: "#343a40", color: "white", padding: "8px 12px", borderRadius: 4 }}>Doctor Diagnoses & History</h4>
      {history.length === 0 ? <p>No records found.</p> : (
        history.map(h => (
          <div key={h._id} style={{ borderLeft: "4px solid #28a745", padding: "10px 15px", marginBottom: 15, background: "#fdfdfd", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ margin: "0 0 5px 0", color: "#666" }}>{new Date(h.date).toLocaleDateString()} — Dr. {h.doctorId?.fullName || "Unknown"}</p>
            <p><strong>Disease:</strong> {h.disease}</p>
            {h.treatment && <p><strong>Treatment:</strong> {h.treatment}</p>}
            {h.surgery && <p><strong>Surgery:</strong> {h.surgery}</p>}
            {h.allergies && <p><strong>Allergies:</strong> {h.allergies}</p>}
            {h.notes && <p style={{ fontStyle: "italic", color: "#555" }}>Notes: {h.notes}</p>}
          </div>
        ))
      )}

      {/* Test & Report Storage */}
      <h4 style={{ background: "#343a40", color: "white", padding: "8px 12px", borderRadius: 4 }}>Lab Tests & Medical Reports</h4>
      {reports.length === 0 ? <p>No reports uploaded.</p> : (
        <ul style={{ paddingLeft: 20 }}>
          {reports.map(r => (
            <li key={r._id} style={{ marginBottom: 10 }}>
              <strong>{r.reportName}</strong> (Uploaded: {new Date(r.date).toLocaleDateString()}) <br/>
              <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#17a2b8", textDecoration: "none", fontWeight: "bold" }}>
                📄 View / Download File
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Appointment History */}
      <h4 style={{ background: "#343a40", color: "white", padding: "8px 12px", borderRadius: 4 }}>Past Appointments</h4>
      {appointments.filter(a => a.status === "completed").length === 0 ? <p>No past completed appointments.</p> : (
        <ul style={{ paddingLeft: 20 }}>
          {appointments.filter(a => a.status === "completed").map(a => (
            <li key={a._id} style={{ marginBottom: 10 }}>
              <strong>Date:</strong> {new Date(a.date).toLocaleDateString()} | <strong>Doctor:</strong> Dr. {a.doctor?.fullName} | <strong>Summary:</strong> {a.review || "No summary provided"}
            </li>
          ))}
        </ul>
      )}

      {/* Prescription History Overview */}
      <h4 style={{ background: "#343a40", color: "white", padding: "8px 12px", borderRadius: 4 }}>Prescription Records</h4>
      {prescriptions.length === 0 ? <p>No prescriptions found.</p> : (
        <ul style={{ paddingLeft: 20 }}>
          {prescriptions.map(p => (
            <li key={p._id} style={{ marginBottom: 10 }}>
              <strong>Date:</strong> {new Date(p.date).toLocaleDateString()} | <strong>Doctor:</strong> Dr. {p.doctorId?.fullName || "Unknown"} | <strong>Diagnosis:</strong> {p.diagnosis}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PatientMedicalHistory;
