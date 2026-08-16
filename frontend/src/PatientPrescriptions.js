import React, { useState, useEffect } from "react";
import axios from "axios";
import PrintablePrescription from "./PrintablePrescription";

function PatientPrescriptions({ user }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicinesMap, setMedicinesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/prescriptions/patient/${user._id}`);
      setPrescriptions(res.data.prescriptions);
      
      const medsMap = {};
      res.data.medicines.forEach(m => {
        if (!medsMap[m.prescriptionId]) medsMap[m.prescriptionId] = [];
        medsMap[m.prescriptionId].push(m);
      });
      setMedicinesMap(medsMap);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient prescriptions", err);
      setLoading(false);
    }
  };

  const filtered = prescriptions.filter(p => {
    const sl = searchTerm.toLowerCase();
    const docName = p.doctorId?.fullName?.toLowerCase() || "";
    const pId = p._id.toLowerCase();
    return docName.includes(sl) || pId.includes(sl);
  });

  const handleDownloadText = (prescription, medicines) => {
    let content = `PRIMACURE\n`;
    content += `PRESCRIPTION DIGITAL COPY\n`;
    content += `==========================\n\n`;
    content += `Prescription ID: ${prescription._id.slice(-6).toUpperCase()}\n`;
    content += `Date: ${new Date(prescription.date).toLocaleDateString()}\n`;
    content += `Doctor: Dr. ${prescription.doctorId?.fullName || "Unknown"}\n`;
    content += `Patient: ${user.fullName}\n\n`;
    content += `DIAGNOSIS:\n${prescription.diagnosis}\n\n`;
    content += `MEDICINES:\n`;
    
    if (medicines && medicines.length > 0) {
      medicines.forEach(m => {
        content += `- ${m.medicineName}: ${m.dosage} | ${m.time} | for ${m.duration}\n`;
      });
    } else {
      content += `No medicines prescribed.\n`;
    }

    if (prescription.notes) {
      content += `\nDOCTOR'S NOTES:\n${prescription.notes}\n`;
    }

    content += `\n==========================\n`;
    content += `Generated on: ${new Date().toLocaleString()}\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prescription_${prescription._id.slice(-6).toUpperCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Prescription ID,Doctor Name,Diagnosis\n";
    
    prescriptions.forEach(p => {
      const date = new Date(p.date).toLocaleDateString();
      const id = p._id.slice(-6).toUpperCase();
      const doctor = `Dr. ${p.doctorId?.fullName || "Unknown"}`;
      const diagnosis = `"${p.diagnosis.replace(/"/g, '""')}"`; // Escape quotes
      csvContent += `${date},${id},${doctor},${diagnosis}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `My_Prescription_History.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (printData) {
    return <PrintablePrescription data={printData} onClose={() => setPrintData(null)} />;
  }

  if (loading) return <p>Loading prescriptions...</p>;

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0 }}>My Prescriptions</h3>
        <button onClick={handleExportCSV} style={{ background: "#6f42c1", color: "white", padding: "8px 16px", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>
          Export History (CSV)
        </button>
      </div>

      <input 
        type="text" 
        placeholder="Search by Doctor Name or Prescription ID..." 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
        style={{ width: "100%", padding: 8, marginBottom: 20, boxSizing: "border-box" }}
      />
      
      {filtered.length === 0 ? (
        <p>No prescriptions match your search.</p>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {filtered.map(p => (
            <div key={p._id} style={{ border: "1px solid #ddd", padding: 15, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <h4 style={{ margin: 0, color: "#007bff" }}>Dr. {p.doctorId?.fullName || "Unknown"}</h4>
                  <small>{p.doctorId?.specialty || ""}</small>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>{new Date(p.date).toLocaleDateString()}</strong><br />
                  <small>ID: {p._id.slice(-6).toUpperCase()}</small>
                </div>
              </div>

              <p><strong>Diagnosis:</strong> {p.diagnosis}</p>
              
              {medicinesMap[p._id] && medicinesMap[p._id].length > 0 && (
                <>
                  <strong>Medicines:</strong>
                  <ul style={{ margin: "5px 0", paddingLeft: 20 }}>
                    {medicinesMap[p._id].map(m => (
                      <li key={m._id}>
                        {m.medicineName} — {m.dosage} ({m.time}) for {m.duration}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {p.notes && <p style={{ fontStyle: "italic", color: "#555", marginTop: 10 }}><strong>Notes:</strong> {p.notes}</p>}

              <div style={{ marginTop: 15, textAlign: "right", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => handleDownloadText(p, medicinesMap[p._id] || [])} style={{ background: "#17a2b8", color: "white", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>
                  Download (.txt)
                </button>
                <button onClick={() => setPrintData({
                  prescription: p,
                  medicines: medicinesMap[p._id] || [],
                  doctor: p.doctorId,
                  patient: user
                })} style={{ background: "#28a745", color: "white", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>
                  View & Print (PDF)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientPrescriptions;
