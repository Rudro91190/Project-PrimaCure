
import express from 'express';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
const router = express.Router();

// Book appointment (patient)
router.post('/book', async (req, res) => {
  try {
    const { patientId, doctorId, date, timeSlot } = req.body;
    // Check for clash
    const clash = await Appointment.findOne({ doctor: doctorId, date, timeSlot });
    if (clash) {
      return res.status(409).json({ message: 'Time slot already booked.' });
    }
    const appointment = new Appointment({ patient: patientId, doctor: doctorId, date, timeSlot });
    await appointment.save();

    // Create a pending payment
    const payment = new Payment({
      patientId,
      appointmentId: appointment._id,
      amount: 500, // Fixed fee for demonstration
      paymentStatus: 'Pending'
    });
    await payment.save();

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Error booking appointment', error: err.message });
  }
});

// Get all appointments for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patient: patientId }).populate('doctor', 'fullName specialty');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments', error: err.message });
  }
});

// Get all appointments for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctor: doctorId }).populate('patient', 'fullName email');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments', error: err.message });
  }
});

// Get reviews for a doctor
router.get('/reviews/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Appointment.find({ doctor: doctorId, rating: { $exists: true } })
      .populate('patient', 'fullName')
      .select('patient rating review createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
});

// Submit review for completed appointment
router.post('/review/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, review } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if appointment is completed (you might need to add logic to mark as completed)
    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Appointment must be completed to leave a review' });
    }

    appointment.rating = rating;
    appointment.review = review;
    await appointment.save();

    // Update doctor's average rating
    const doctor = await User.findById(appointment.doctor);
    const allReviews = await Appointment.find({ doctor: appointment.doctor, rating: { $exists: true } });
    const totalRating = allReviews.reduce((sum, app) => sum + app.rating, 0);
    doctor.averageRating = totalRating / allReviews.length;
    doctor.totalReviews = allReviews.length;
    await doctor.save();

    res.json({ message: 'Review submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting review', error: err.message });
  }
});

// Mark appointment as completed (doctor)
router.put('/complete/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' }, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment marked as completed', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Error updating appointment', error: err.message });
  }
});

// Confirm appointment (doctor)
router.put('/confirm/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status: 'confirmed' }, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment confirmed', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Error updating appointment', error: err.message });
  }
});

// Cancel appointment (doctor)
router.put('/cancel/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status: 'cancelled' }, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Error updating appointment', error: err.message });
  }
});

export default router;
