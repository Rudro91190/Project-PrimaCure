import Payment from "../models/Payment.js";
import Transaction from "../models/Transaction.js";

// Create a new pending payment (typically called when an appointment is confirmed)
export const createPayment = async (req, res) => {
  try {
    const { patientId, appointmentId, amount } = req.body;
    const payment = new Payment({
      patientId,
      appointmentId,
      amount,
      paymentStatus: "Pending"
    });
    await payment.save();
    res.status(201).json({ message: "Payment record created", payment });
  } catch (err) {
    res.status(500).json({ message: "Error creating payment", error: err.message });
  }
};

// Process payment (Simulated payment gateway)
export const processPayment = async (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;
    const payment = await Payment.findById(paymentId);
    
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.paymentStatus === "Paid") return res.status(400).json({ message: "Already paid" });

    // Update payment
    payment.paymentStatus = "Paid";
    payment.paymentMethod = paymentMethod;
    payment.paymentDate = new Date();
    await payment.save();

    // Create transaction record
    const transaction = new Transaction({
      paymentId: payment._id,
      transactionId: "TXN" + Math.floor(Math.random() * 1000000000), // mock TXN id
      amount: payment.amount
    });
    await transaction.save();

    res.json({ message: "Payment successful", payment, transaction });
  } catch (err) {
    res.status(500).json({ message: "Error processing payment", error: err.message });
  }
};

// Get all payments for a specific patient
export const getPatientPayments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const payments = await Payment.find({ patientId }).populate("appointmentId");
    
    // Fetch related transactions
    const paymentIds = payments.map(p => p._id);
    const transactions = await Transaction.find({ paymentId: { $in: paymentIds } });

    res.json({ payments, transactions });
  } catch (err) {
    res.status(500).json({ message: "Error fetching patient payments", error: err.message });
  }
};

// Admin: Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("patientId", "fullName email")
      .populate("appointmentId");
      
    const transactions = await Transaction.find().populate({
      path: "paymentId",
      populate: { path: "patientId", select: "fullName" }
    });

    res.json({ payments, transactions });
  } catch (err) {
    res.status(500).json({ message: "Error fetching all payments", error: err.message });
  }
};

// Admin: Update payment status manually
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(paymentId, { paymentStatus: status }, { new: true });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment status updated", payment });
  } catch (err) {
    res.status(500).json({ message: "Error updating payment status", error: err.message });
  }
};
