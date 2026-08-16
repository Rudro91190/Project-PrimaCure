import React, { useState, useEffect } from "react";
import axios from "axios";

function OnlineConsultation({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctorId: "",
    symptoms: "",
    medicalHistory: "",
    consultationType: "video",
    preferredDate: "",
    preferredTime: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const timeSlots = [
    "09:00-09:30",
    "09:30-10:00",
    "10:00-10:30",
    "10:30-11:00",
    "11:00-11:30",
    "11:30-12:00",
    "12:00-12:30",
    "12:30-13:00",
    "14:00-14:30",
    "14:30-15:00",
    "15:00-15:30",
    "15:30-16:00",
    "16:00-16:30",
    "16:30-17:00",
  ];

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
    if (user && user._id) {
      fetchConsultations();
    }
  }, [user]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/doctors",
      );
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
    }
  };

  const fetchConsultations = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/consultations/patient/${user._id}`,
      );
      setConsultations(response.data);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !form.doctorId ||
      !form.symptoms ||
      !form.preferredDate ||
      !form.preferredTime
    ) {
      setMessage("Please fill in all required fields");
      setMessageType("error");
      return;
    }

    // Validate date is in future
    const selectedDate = new Date(form.preferredDate);
    if (selectedDate < new Date()) {
      setMessage("Please select a future date");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/consultations/request",
        {
          patientId: user._id,
          doctorId: form.doctorId,
          symptoms: form.symptoms,
          medicalHistory: form.medicalHistory,
          consultationType: form.consultationType,
          preferredDate: form.preferredDate,
          preferredTime: form.preferredTime,
        },
      );

      setMessage("Consultation request submitted successfully!");
      setMessageType("success");

      // Reset form
      setForm({
        doctorId: "",
        symptoms: "",
        medicalHistory: "",
        consultationType: "video",
        preferredDate: "",
        preferredTime: "",
      });

      // Refresh consultations
      fetchConsultations();

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Error submitting consultation request",
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConsultation = async (consultationId) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this consultation request?",
      )
    ) {
      try {
        await axios.put(
          `http://localhost:5000/api/consultations/${consultationId}/cancel`,
        );
        setMessage("Consultation cancelled successfully");
        setMessageType("success");
        fetchConsultations();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Error cancelling consultation",
        );
        setMessageType("error");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "#ffc107",
      accepted: "#28a745",
      rejected: "#dc3545",
      completed: "#007bff",
      cancelled: "#6c757d",
    };

    return (
      <span
        style={{
          display: "inline-block",
          padding: "5px 10px",
          borderRadius: "5px",
          backgroundColor: statusColors[status] || "#6c757d",
          color: "white",
          fontSize: "0.85em",
          fontWeight: "bold",
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Online Consultation Request</h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            ...styles.toggleButton,
            backgroundColor: showHistory ? "#dc3545" : "#007bff",
          }}
        >
          {showHistory ? "Show Form" : "View My Requests"}
        </button>
      </div>

      {message && (
        <div
          style={{
            ...styles.message,
            backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da",
            color: messageType === "success" ? "#155724" : "#721c24",
            borderColor: messageType === "success" ? "#c3e6cb" : "#f5c6cb",
          }}
        >
          {message}
        </div>
      )}

      {!showHistory ? (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="doctorId" style={styles.label}>
              Select Doctor <span style={{ color: "red" }}>*</span>
            </label>
            <select
              id="doctorId"
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">-- Choose a Doctor --</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.fullName} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="symptoms" style={styles.label}>
              Describe Your Symptoms <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={form.symptoms}
              onChange={handleChange}
              placeholder="Please describe your symptoms in detail"
              rows="4"
              style={{ ...styles.input, resize: "vertical" }}
              required
              maxLength="1000"
            />
            <small style={{ color: "#666" }}>
              {form.symptoms.length}/1000 characters
            </small>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="medicalHistory" style={styles.label}>
              Medical History (Optional)
            </label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={form.medicalHistory}
              onChange={handleChange}
              placeholder="Any relevant medical history or allergies"
              rows="3"
              style={{ ...styles.input, resize: "vertical" }}
              maxLength="1000"
            />
            <small style={{ color: "#666" }}>
              {form.medicalHistory.length}/1000 characters
            </small>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label htmlFor="consultationType" style={styles.label}>
                Consultation Type <span style={{ color: "red" }}>*</span>
              </label>
              <select
                id="consultationType"
                name="consultationType"
                value={form.consultationType}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="video">Video Call</option>
                <option value="audio">Audio Call</option>
                <option value="chat">Text Chat</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="preferredDate" style={styles.label}>
                Preferred Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="preferredDate"
                type="date"
                name="preferredDate"
                value={form.preferredDate}
                onChange={handleChange}
                style={styles.input}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="preferredTime" style={styles.label}>
              Preferred Time Slot <span style={{ color: "red" }}>*</span>
            </label>
            <select
              id="preferredTime"
              name="preferredTime"
              value={form.preferredTime}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">-- Select Time Slot --</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Request Consultation"}
          </button>
        </form>
      ) : (
        <div style={styles.historyContainer}>
          <h2>My Consultation Requests</h2>
          {consultations.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              No consultation requests yet.
            </p>
          ) : (
            <div>
              {consultations.map((consultation) => (
                <div key={consultation._id} style={styles.consultationCard}>
                  <div style={styles.consultationHeader}>
                    <div>
                      <h3 style={{ margin: "0 0 5px 0" }}>
                        Dr. {consultation.doctor.fullName}
                      </h3>
                      <p
                        style={{
                          margin: "0",
                          color: "#666",
                          fontSize: "0.9em",
                        }}
                      >
                        {consultation.doctor.specialty}
                      </p>
                    </div>
                    {getStatusBadge(consultation.status)}
                  </div>

                  <div style={styles.consultationDetails}>
                    <p>
                      <strong>Type:</strong>{" "}
                      {consultation.consultationType.charAt(0).toUpperCase() +
                        consultation.consultationType.slice(1)}
                    </p>
                    <p>
                      <strong>Preferred Date:</strong>{" "}
                      {new Date(
                        consultation.preferredDate,
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Preferred Time:</strong>{" "}
                      {consultation.preferredTime}
                    </p>
                    <p>
                      <strong>Symptoms:</strong> {consultation.symptoms}
                    </p>
                    {consultation.medicalHistory && (
                      <p>
                        <strong>Medical History:</strong>{" "}
                        {consultation.medicalHistory}
                      </p>
                    )}
                    {consultation.status === "accepted" &&
                      consultation.consultationLink && (
                        <p>
                          <strong>Consultation Link:</strong>
                          <a
                            href={consultation.consultationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#007bff", marginLeft: "5px" }}
                          >
                            Join Call
                          </a>
                        </p>
                      )}
                    {consultation.status === "rejected" &&
                      consultation.rejectionReason && (
                        <p style={{ color: "#dc3545" }}>
                          <strong>Rejection Reason:</strong>{" "}
                          {consultation.rejectionReason}
                        </p>
                      )}
                    {consultation.status === "completed" &&
                      consultation.notes && (
                        <p>
                          <strong>Doctor's Notes:</strong> {consultation.notes}
                        </p>
                      )}
                    <p
                      style={{
                        fontSize: "0.85em",
                        color: "#999",
                        margin: "10px 0 0 0",
                      }}
                    >
                      Requested on:{" "}
                      {new Date(consultation.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {(consultation.status === "pending" ||
                    consultation.status === "accepted") && (
                    <button
                      onClick={() => handleCancelConsultation(consultation._id)}
                      style={{
                        ...styles.cancelButton,
                      }}
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "2px solid #007bff",
    paddingBottom: "10px",
  },
  toggleButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    color: "white",
    cursor: "pointer",
    fontSize: "1em",
    transition: "background-color 0.3s",
  },
  message: {
    padding: "12px 16px",
    borderRadius: "4px",
    marginBottom: "20px",
    border: "1px solid",
    animation: "fadeIn 0.3s",
  },
  form: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  formGroup: {
    marginBottom: "20px",
  },
  formRow: {
    display: "flex",
    gap: "20px",
    justifyContent: "space-between",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "1em",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1em",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  historyContainer: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  consultationCard: {
    backgroundColor: "white",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  consultationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  consultationDetails: {
    marginBottom: "15px",
  },
  cancelButton: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.9em",
    transition: "background-color 0.3s",
  },
};

export default OnlineConsultation;
