import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './config';

function BookAppointment({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: '' });
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const timeSlots = [
    '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
    '11:00-11:30', '11:30-12:00', '12:00-12:30', '12:30-13:00',
    '14:00-14:30', '14:30-15:00', '15:00-15:30', '15:30-16:00'
  ];

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/doctors`)
      .then(res => setDoctors(res.data))
      .catch(() => setDoctors([]));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'doctorId' && value) {
      fetchReviews(value);
    }
  };

  const fetchReviews = async (doctorId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/appointments/reviews/${doctorId}`);
      setReviews(res.data);
    } catch (err) {
      setReviews([]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/api/appointments/book`, {
        patientId: user._id,
        doctorId: form.doctorId,
        date: form.date,
        timeSlot: form.timeSlot
      });
      setMessage('Appointment booked successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="appointment-form">
        <h3>Book Appointment</h3>
        <div>
          <label>Doctor:</label><br />
          <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
            <option value="">Select Doctor</option>
            {doctors.map(doc => (
              <option key={doc._id} value={doc._id}>
                {doc.fullName} ({doc.specialty}) - Rating: {doc.averageRating ? `${doc.averageRating.toFixed(1)} ⭐ (${doc.totalReviews} reviews)` : 'No reviews yet'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Date:</label><br />
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </div>
        <div>
          <label>Time Slot:</label><br />
          <select name="timeSlot" value={form.timeSlot} onChange={handleChange} required>
            <option value="">Select Time Slot</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
        <button type="submit">Book</button>
        {message && <div className="message">{message}</div>}
      </form>

      {form.doctorId && (
        <div className="reviews-section">
          <h4>Reviews for Selected Doctor</h4>
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review._id} className="review">
                <p><strong>{review.patient.fullName}</strong> - {review.rating} ⭐</p>
                <p>{review.review}</p>
                <small>{new Date(review.createdAt).toLocaleDateString()}</small>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      )}
    </>
  );
}

export default BookAppointment;
