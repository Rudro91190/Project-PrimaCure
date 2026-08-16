import React from "react";

function PaymentReceipt({ data, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card" style={{ marginTop: 20, maxWidth: 500, margin: "20px auto" }}>
      <div id="receipt-content" style={{ padding: 20, border: "1px dashed #ccc" }}>
        <h2 style={{ textAlign: "center", color: "#f76b1c" }}>PrimaCure</h2>
        <h3 style={{ textAlign: "center" }}>Payment Receipt</h3>
        <hr />
        <p><strong>Patient Name:</strong> {data.patientName}</p>
        <p><strong>Transaction ID:</strong> {data.transactionId}</p>
        <p><strong>Date:</strong> {new Date(data.date).toLocaleString()}</p>
        <p><strong>Amount Paid:</strong> ${data.amount}</p>
        <hr />
        <p style={{ textAlign: "center", fontStyle: "italic" }}>Thank you for your payment.</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button onClick={handlePrint} style={{ background: "#4caf50", flex: 1, marginRight: 10 }}>Print / Save PDF</button>
        <button onClick={onClose} style={{ background: "#ccc", color: "#000", flex: 1 }}>Close</button>
      </div>
    </div>
  );
}

export default PaymentReceipt;
