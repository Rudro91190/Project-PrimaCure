import React, { useState, useEffect } from "react";
import axios from "axios";
import PrintablePrescription from "./PrintablePrescription";
import API_BASE_URL from "./config";

function DoctorPrescriptions({ user }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicinesMap, setMedicinesMap] = useState({});
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    patientId: "",
    diagnosis: "",
    notes: "",
    medicines: []
  });

  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/prescriptions/doctor/${user._id}`);
      setPrescriptions(res.data.prescriptions);
      
      const medsMap = {};
      res.data.medicines.forEach(m => {
        if (!medsMap[m.prescriptionId]) medsMap[m.prescriptionId] = [];
        medsMap[m.prescriptionId].push(m);
      });
      setMedicinesMap(medsMap);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching prescriptions", err);
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/prescriptions/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients", err);
    }
  };

  const handleAddMedicine = () => {
    setForm({
      ...form,
      medicines: [...form.medicines, { medicineName: "", dosage: "", time: "", duration: "" }]
    });
  };

  const handleRemoveMedicine = (index) => {
    const updated = form.medicines.filter((_, i) => i !== index);
    setForm({ ...form, medicines: updated });
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...form.medicines];
    updated[index][field] = value;
    setForm({ ...form, medicines: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/prescriptions/update/${editingId}`, {
          diagnosis: form.diagnosis,
          notes: form.notes,
          medicines: form.medicines
        });
        alert("Prescription updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/prescriptions/create`, {
          ...form,
          doctorId: user._id
        });
        alert("Prescription saved successfully!");
      }
      setShowForm(false);
      fetchPrescriptions();
    } catch (err) {
      alert("Error saving prescription");
    }
  };

  const openEdit = (prescription) => {
    setForm({
      patientId: prescription.patientId._id,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
      medicines: medicinesMap[prescription._id] || []
    });
    setEditingId(prescription._id);
    setShowForm(true);
  };

  const openNew = () => {
    setForm({ patientId: "", diagnosis: "", notes: "", medicines: [] });
    setEditingId(null);
    setShowForm(true);
  };

  const filtered = prescriptions.filter(p => {
    const sl = searchTerm.toLowerCase();
    const pName = p.patientId?.fullName?.toLowerCase() || "";
    const pId = p._id.toLowerCase();
    const pDate = new Date(p.date).toLocaleDateString().toLowerCase();
    return pName.includes(sl) || pId.includes(sl) || pDate.includes(sl);
  });

  if (printData) {
    return <PrintablePrescription data={printData} onClose={() => setPrintData(null)} />;
  }

  if (loading) return <p>Loading prescriptions...</p>;

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Prescription Management</h3>
        <button onClick={openNew} style={{ background: "#007bff", color: "white", padding: "8px 16px" }}>
          + Write New Prescription
        </button>
      </div>

      {showForm ? (
        <div style={{ border: "1px solid #ccc", padding: 20, marginTop: 20, borderRadius: 8 }}>
          <h4>{editingId ? "Edit Prescription" : "New Prescription"}</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 10 }}>
              <label>Patient:</label><br />
              <select 
                value={form.patientId} 
                onChange={e => setForm({ ...form, patientId: e.target.value })} 
                required 
                disabled={!!editingId}
                style={{ padding: 8, width: "100%", marginTop: 5 }}
              >
                <option value="">Select a patient...</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.fullName} ({p.email})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Diagnosis:</label><br />
              <input type="text" required value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} style={{ padding: 8, width: "100%", marginTop: 5 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Notes & Instructions:</label><br />
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={{ padding: 8, width: "100%", marginTop: 5 }} />
            </div>

            <h4>Medicines</h4>
            {form.medicines.map((m, index) => (
              <div key={index} style={{ border: "1px solid #e0e0e0", padding: 15, marginBottom: 15, borderRadius: 8, background: "#fdfdfd", position: "relative" }}>
                <button 
                  type="button" 
                  onClick={() => handleRemoveMedicine(index)} 
                  style={{ position: "absolute", top: 10, right: 10, background: "#dc3545", color: "white", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  title="Remove Medicine"
                >
                  ✕
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 10 }}>
                  <div>
                    <label style={{ fontSize: "0.85em", color: "#555", display: "block", marginBottom: 4 }}>Medicine Name</label>
                    <input type="text" placeholder="e.g. Paracetamol" value={m.medicineName} onChange={e => handleMedChange(index, "medicineName", e.target.value)} required style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85em", color: "#555", display: "block", marginBottom: 4 }}>Dosage</label>
                    <input type="text" placeholder="e.g. 1 Tablet" value={m.dosage} onChange={e => handleMedChange(index, "dosage", e.target.value)} required style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85em", color: "#555", display: "block", marginBottom: 4 }}>Time</label>
                    <input type="text" placeholder="e.g. Morning & Night" value={m.time} onChange={e => handleMedChange(index, "time", e.target.value)} required style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85em", color: "#555", display: "block", marginBottom: 4 }}>Duration</label>
                    <input type="text" placeholder="e.g. 7 Days" value={m.duration} onChange={e => handleMedChange(index, "duration", e.target.value)} required style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={handleAddMedicine} style={{ background: "#28a745", color: "white", padding: "8px 16px", marginBottom: 20, borderRadius: 4, border: "none", cursor: "pointer", fontWeight: "bold" }}>+ Add Another Medicine</button>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={{ background: "#007bff", color: "white", flex: 1 }}>Save Prescription</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "#6c757d", color: "white", flex: 1 }}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <input 
            type="text" 
            placeholder="Search by Patient Name, ID, or Date..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ width: "100%", padding: 8, margin: "20px 0", boxSizing: "border-box" }}
          />

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Patient</th>
                <th style={thStyle}>Diagnosis</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td style={tdStyle}>{new Date(p.date).toLocaleDateString()}</td>
                  <td style={tdStyle}>{p._id.slice(-6).toUpperCase()}</td>
                  <td style={tdStyle}>{p.patientId?.fullName || "Unknown"}</td>
                  <td style={tdStyle}>{p.diagnosis}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(p)} style={{ background: "#f0ad4e", color: "white", marginRight: 5, padding: "4px 8px" }}>Edit</button>
                    <button onClick={() => setPrintData({
                      prescription: p,
                      medicines: medicinesMap[p._id] || [],
                      doctor: user,
                      patient: p.patientId
                    })} style={{ background: "#17a2b8", color: "white", padding: "4px 8px" }}>Print</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="5" style={tdStyle}>No prescriptions found.</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const thStyle = { borderBottom: "2px solid #ddd", padding: 8, textAlign: "left" };
const tdStyle = { borderBottom: "1px solid #eee", padding: 8 };

export default DoctorPrescriptions;
