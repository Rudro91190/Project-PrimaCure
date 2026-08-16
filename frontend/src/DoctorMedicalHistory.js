import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

function DoctorMedicalHistory({ user }) {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Data for selected patient
  const [history, setHistory] = useState([]);
  const [reports, setReports] = useState([]);

  // Forms
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [historyForm, setHistoryForm] = useState({ disease: "", treatment: "", surgery: "", allergies: "", notes: "" });
  
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportFile, setReportFile] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // Using the prescription route we created earlier that gets all patients
      const res = await axios.get(`${API_BASE_URL}/api/prescriptions/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients", err);
    }
  };

  const loadPatientData = async (patient) => {
    setSelectedPatient(patient);
    try {
      const [histRes, repRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/medical-history/patient/${patient._id}`),
        axios.get(`${API_BASE_URL}/api/reports/patient/${patient._id}`)
      ]);
      setHistory(histRes.data || []);
      setReports(repRes.data || []);
      setShowHistoryForm(false);
      setShowReportForm(false);
    } catch (err) {
      console.error("Error loading patient records", err);
    }
  };

  const handleAddHistory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/medical-history/add`, {
        patientId: selectedPatient._id,
        doctorId: user._id,
        ...historyForm
      });
      alert("Medical history saved!");
      setHistoryForm({ disease: "", treatment: "", surgery: "", allergies: "", notes: "" });
      loadPatientData(selectedPatient); // refresh
    } catch (err) {
      alert("Error saving history");
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!reportFile) return alert("Please select a file to upload");

    const formData = new FormData();
    formData.append("patientId", selectedPatient._id);
    formData.append("doctorId", user._id);
    formData.append("reportName", reportName);
    formData.append("reportFile", reportFile);

    try {
      await axios.post(`${API_BASE_URL}/api/reports/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Report uploaded successfully!");
      setReportName("");
      setReportFile(null);
      loadPatientData(selectedPatient); // refresh
    } catch (err) {
      alert("Error uploading report");
    }
  };

  const filteredPatients = patients.filter(p => {
    const sl = searchTerm.toLowerCase();
    return (p.fullName && p.fullName.toLowerCase().includes(sl)) || 
           (p._id && p._id.toLowerCase().includes(sl)) || 
           (p.phone && p.phone.includes(sl));
  });

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3>Patient Record Management</h3>
      
      {!selectedPatient ? (
        <div>
          <input 
            type="text" 
            placeholder="Search Patient by Name, ID, or Phone..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ width: "100%", padding: 8, marginBottom: 20, boxSizing: "border-box" }}
          />
          <ul style={{ listStyle: "none", padding: 0 }}>
            {filteredPatients.map(p => (
              <li key={p._id} style={{ padding: 15, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{p.fullName}</strong> <small>({p.email})</small>
                  <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "0.85em" }}>ID: {p._id} | Phone: {p.phone || "N/A"}</p>
                </div>
                <button onClick={() => loadPatientData(p)} style={{ background: "#007bff", color: "white", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>
                  View Records
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedPatient(null)} style={{ marginBottom: 20, background: "#6c757d", color: "white", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>
            ← Back to Search
          </button>

          <div style={{ background: "#f8f9fa", padding: 15, borderRadius: 8, marginBottom: 20, border: "1px solid #dee2e6" }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Patient Profile: {selectedPatient.fullName}</h4>
            <p style={{ margin: "2px 0" }}><strong>ID:</strong> {selectedPatient._id}</p>
            <p style={{ margin: "2px 0" }}><strong>Email:</strong> {selectedPatient.email}</p>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button onClick={() => { setShowHistoryForm(true); setShowReportForm(false); }} style={{ background: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>+ Add Medical History</button>
            <button onClick={() => { setShowReportForm(true); setShowHistoryForm(false); }} style={{ background: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>+ Upload Test Report</button>
          </div>

          {showHistoryForm && (
            <div style={{ border: "1px solid #28a745", padding: 15, borderRadius: 8, marginBottom: 20 }}>
              <h4 style={{ marginTop: 0, color: "#28a745" }}>Add Medical History Record</h4>
              <form onSubmit={handleAddHistory}>
                <input type="text" placeholder="Disease/Condition" value={historyForm.disease} onChange={e => setHistoryForm({...historyForm, disease: e.target.value})} required style={inputStyle} />
                <input type="text" placeholder="Treatment Given" value={historyForm.treatment} onChange={e => setHistoryForm({...historyForm, treatment: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="Surgery History (if any)" value={historyForm.surgery} onChange={e => setHistoryForm({...historyForm, surgery: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="Allergies" value={historyForm.allergies} onChange={e => setHistoryForm({...historyForm, allergies: e.target.value})} style={inputStyle} />
                <textarea placeholder="Doctor's Notes" value={historyForm.notes} onChange={e => setHistoryForm({...historyForm, notes: e.target.value})} rows="3" style={inputStyle} />
                <button type="submit" style={{ background: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: 4, cursor: "pointer" }}>Save Record</button>
                <button type="button" onClick={() => setShowHistoryForm(false)} style={{ background: "transparent", color: "#666", padding: "8px 16px", border: "none", cursor: "pointer", marginLeft: 10 }}>Cancel</button>
              </form>
            </div>
          )}

          {showReportForm && (
            <div style={{ border: "1px solid #17a2b8", padding: 15, borderRadius: 8, marginBottom: 20 }}>
              <h4 style={{ marginTop: 0, color: "#17a2b8" }}>Upload Test/Medical Report</h4>
              <form onSubmit={handleUploadReport}>
                <input type="text" placeholder="Report Name (e.g. Blood Test, X-Ray)" value={reportName} onChange={e => setReportName(e.target.value)} required style={inputStyle} />
                <input type="file" accept=".pdf, image/*" onChange={e => setReportFile(e.target.files[0])} required style={{ ...inputStyle, padding: "5px 0" }} />
                <p style={{ fontSize: "0.8em", color: "#666", marginTop: -10, marginBottom: 10 }}>Supported: PDF, JPG, PNG</p>
                <button type="submit" style={{ background: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: 4, cursor: "pointer" }}>Upload File</button>
                <button type="button" onClick={() => setShowReportForm(false)} style={{ background: "transparent", color: "#666", padding: "8px 16px", border: "none", cursor: "pointer", marginLeft: 10 }}>Cancel</button>
              </form>
            </div>
          )}

          {/* History Timeline */}
          <h4 style={{ background: "#343a40", color: "white", padding: "8px 12px", borderRadius: 4 }}>Recorded History</h4>
          {history.length === 0 ? <p>No medical history records found.</p> : (
            history.map(h => (
              <div key={h._id} style={{ borderLeft: "4px solid #28a745", padding: "10px 15px", marginBottom: 15, background: "#fdfdfd", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <p style={{ margin: "0 0 5px 0", color: "#666" }}>{new Date(h.date).toLocaleDateString()} — Recorded by Dr. {h.doctorId?.fullName || "Unknown"}</p>
                <p><strong>Disease:</strong> {h.disease}</p>
                {h.treatment && <p><strong>Treatment:</strong> {h.treatment}</p>}
                {h.surgery && <p><strong>Surgery:</strong> {h.surgery}</p>}
                {h.allergies && <p><strong>Allergies:</strong> {h.allergies}</p>}
                {h.notes && <p style={{ fontStyle: "italic", color: "#555" }}>Notes: {h.notes}</p>}
              </div>
            ))
          )}

          {/* Reports Timeline */}
          <h4 style={{ background: "#343a40", color: "white", padding: "8px 12px", borderRadius: 4 }}>Uploaded Reports</h4>
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
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: "100%", padding: 8, marginBottom: 15, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 };

export default DoctorMedicalHistory;
