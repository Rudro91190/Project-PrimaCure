import React, { useState, useEffect } from "react";
import axios from "axios";
import PaymentReceipt from "./PaymentReceipt";

function PatientPayments({ user }) {
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/payments/patient/${user._id}`);
      setPayments(res.data.payments);
      setTransactions(res.data.transactions);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payments", err);
      setLoading(false);
    }
  };

  const handlePay = async (paymentId) => {
    try {
      const res = await axios.post("http://localhost:5000/api/payments/process", {
        paymentId,
        paymentMethod
      });
      alert("Payment Successful!");
      setReceiptData({
        patientName: user.fullName,
        amount: res.data.payment.amount,
        date: res.data.payment.paymentDate,
        transactionId: res.data.transaction.transactionId
      });
      fetchPayments();
      setSelectedPayment(null);
    } catch (err) {
      alert("Payment failed: " + (err.response?.data?.message || err.message));
    }
  };

  if (receiptData) {
    return <PaymentReceipt data={receiptData} onClose={() => setReceiptData(null)} />;
  }

  if (loading) return <p>Loading payments...</p>;

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3>My Payments</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Appointment ID</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p._id}>
              <td style={tdStyle}>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td style={tdStyle}>{p.appointmentId?._id || "N/A"}</td>
              <td style={tdStyle}>${p.amount}</td>
              <td style={tdStyle}>
                <span style={{ color: p.paymentStatus === "Paid" ? "green" : p.paymentStatus === "Failed" ? "red" : "orange" }}>
                  {p.paymentStatus}
                </span>
              </td>
              <td style={tdStyle}>
                {p.paymentStatus === "Pending" && (
                  <button onClick={() => setSelectedPayment(p._id)} style={{ padding: "4px 8px" }}>Pay Now</button>
                )}
                {p.paymentStatus === "Paid" && (
                  <button onClick={() => {
                    const txn = transactions.find(t => t.paymentId === p._id);
                    setReceiptData({
                      patientName: user.fullName,
                      amount: p.amount,
                      date: p.paymentDate,
                      transactionId: txn?.transactionId || "N/A"
                    });
                  }} style={{ padding: "4px 8px", background: "#4caf50" }}>Receipt</button>
                )}
              </td>
            </tr>
          ))}
          {payments.length === 0 && <tr><td colSpan="5" style={tdStyle}>No payments found.</td></tr>}
        </tbody>
      </table>

      {selectedPayment && (
        <div style={{ padding: 16, border: "1px solid #ccc", borderRadius: 8, marginBottom: 20 }}>
          <h4>Process Payment</h4>
          <label>Select Method: </label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ marginLeft: 10, padding: 4 }}>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="Mobile Banking">Mobile Banking</option>
          </select>
          <br /><br />
          <button onClick={() => handlePay(selectedPayment)} style={{ background: "#4caf50" }}>Confirm Payment</button>
          <button onClick={() => setSelectedPayment(null)} style={{ marginLeft: 10, background: "#ccc", color: "#000" }}>Cancel</button>
        </div>
      )}

      <h3>Transaction History</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Transaction ID</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t._id}>
              <td style={tdStyle}>{t.transactionId}</td>
              <td style={tdStyle}>{new Date(t.date).toLocaleString()}</td>
              <td style={tdStyle}>${t.amount}</td>
            </tr>
          ))}
          {transactions.length === 0 && <tr><td colSpan="3" style={tdStyle}>No transactions yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { borderBottom: "2px solid #ddd", padding: 8, textAlign: "left" };
const tdStyle = { borderBottom: "1px solid #eee", padding: 8 };

export default PatientPayments;
