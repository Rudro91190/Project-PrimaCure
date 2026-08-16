import React from "react";

function PrintablePrescription({ data, onClose }) {
  const { prescription, medicines, doctor, patient } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card" style={{ marginTop: 20, maxWidth: 800, margin: "20px auto" }}>
      <div id="prescription-print" style={{ padding: 40, border: "2px solid #ccc", backgroundColor: "white", color: "black" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #007bff", paddingBottom: 20, marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, color: "#007bff" }}>PrimaCure</h2>
            <h3 style={{ margin: "5px 0 0 0" }}>Dr. {doctor?.fullName || "Unknown"}</h3>
            <p style={{ margin: 0 }}>{doctor?.specialty || "Medical Doctor"}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(prescription.date).toLocaleDateString()}</p>
            <p style={{ margin: 0 }}><strong>Prescription ID:</strong> {prescription._id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        {/* Patient Details */}
        <div style={{ marginBottom: 30 }}>
          <p style={{ margin: "5px 0" }}><strong>Patient Name:</strong> {patient?.fullName || "Unknown"}</p>
          <p style={{ margin: "5px 0" }}><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
        </div>

        {/* Rx Symbol */}
        <h1 style={{ fontSize: "3em", margin: "10px 0" }}>Rx</h1>

        {/* Medicines */}
        <div style={{ minHeight: "200px" }}>
          {medicines && medicines.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
              <thead>
                <tr>
                  <th style={printTh}>Medicine</th>
                  <th style={printTh}>Dosage</th>
                  <th style={printTh}>Time</th>
                  <th style={printTh}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m, idx) => (
                  <tr key={idx}>
                    <td style={printTd}><strong>{m.medicineName}</strong></td>
                    <td style={printTd}>{m.dosage}</td>
                    <td style={printTd}>{m.time}</td>
                    <td style={printTd}>{m.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No medicines prescribed.</p>
          )}
        </div>

        {/* Notes */}
        {prescription.notes && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px dashed #ccc" }}>
            <strong>Doctor's Notes / Special Instructions:</strong>
            <p style={{ whiteSpace: "pre-wrap" }}>{prescription.notes}</p>
          </div>
        )}

        {/* Footer Signature & Verification */}
        <div style={{ marginTop: 50, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ border: "1px solid #ccc", padding: 10, borderRadius: 4, background: "#f9f9f9", fontSize: "0.85em" }}>
              <strong>Digital Pharmacy Verification Code:</strong><br />
              <span style={{ fontFamily: "monospace", letterSpacing: 2, fontSize: "1.2em", color: "#6f42c1" }}>
                PHARM-{prescription._id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p>_______________________</p>
            <p>Doctor's Signature</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, gap: 10 }}>
        <button onClick={handlePrint} style={{ background: "#4caf50", color: "white", padding: "10px 20px" }}>Print Prescription</button>
        <button onClick={onClose} style={{ background: "#6c757d", color: "white", padding: "10px 20px" }}>Go Back</button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #prescription-print, #prescription-print * { visibility: visible; }
          #prescription-print { position: absolute; left: 0; top: 0; width: 100%; border: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}

const printTh = { borderBottom: "2px solid #000", padding: 8, textAlign: "left" };
const printTd = { borderBottom: "1px solid #ccc", padding: 8 };

export default PrintablePrescription;
