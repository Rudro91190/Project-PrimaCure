import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

// 🌟 Premium Custom Dropdown Select Component to replace standard native options
function CustomSelect({ value, onChange, options, placeholder, icon, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div 
      ref={dropdownRef} 
      className={`custom-select-container ${isOpen ? "open" : ""}`}
      id={id}
      style={{
        position: "relative",
        width: "220px",
        fontFamily: "var(--font)",
      }}
    >
      {/* Trigger Button */}
      <div
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "#FFFFFF",
          border: isOpen ? "1.5px solid var(--primary)" : "1.5px solid #E2E8F0",
          borderRadius: "14px",
          fontSize: "0.88rem",
          fontWeight: 600,
          color: "var(--text-heading)",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: isOpen 
            ? "0 0 0 4px rgba(37, 99, 235, 0.08), 0 4px 12px rgba(37, 99, 235, 0.05)" 
            : "0 2px 6px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {icon && <span style={{ fontSize: "1rem", opacity: 0.85 }}>{icon}</span>}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <span 
          style={{
            display: "inline-block",
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            fontSize: "0.75rem",
            color: isOpen ? "var(--primary)" : "#6B7280"
          }}
        >
          ▼
        </span>
      </div>

      {/* Options List popover with animation and scrollable window */}
      {isOpen && (
        <div
          className="custom-select-options"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)",
            zIndex: 1000,
            overflow: "hidden",
            maxHeight: "260px",
            overflowY: "auto",
            animation: "fadeInUpCustom 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            padding: "6px",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                className={`custom-select-option ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "0.88rem",
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "var(--primary)" : "var(--text-body)",
                  background: isSelected 
                    ? "rgba(37, 99, 235, 0.06)" 
                    : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "2px",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "#F3F4F6";
                    e.currentTarget.style.color = "var(--text-heading)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-body)";
                  }
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <span style={{ fontSize: "0.8rem", color: "var(--primary)" }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DoctorSearch() {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [availability, setAvailability] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [allSpecialties, setAllSpecialties] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSpecialties();
    searchDoctors();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/doctors`);
      const specs = res.data.map(d => d.specialty).filter(Boolean);
      const uniqueSpecs = [...new Set(specs)];
      setAllSpecialties(uniqueSpecs);
    } catch (err) {
      console.error("Error fetching specialties:", err);
    }
  };

  const searchDoctors = async (customParams = {}) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/doctors/search`, {
        params: {
          name: customParams.hasOwnProperty("name") ? customParams.name : name,
          specialty: customParams.hasOwnProperty("specialty") ? customParams.specialty : specialty,
          availability: customParams.hasOwnProperty("availability") ? customParams.availability : availability,
        },
      });
      setDoctors(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyChange = (val) => {
    setSpecialty(val);
    searchDoctors({ specialty: val });
  };

  const handleAvailabilityChange = (val) => {
    setAvailability(val);
    searchDoctors({ availability: val });
  };

  const getSortedDoctors = () => {
    const sorted = [...doctors];
    if (sortBy === "rating-desc") {
      sorted.sort((a, b) => (b.averageRating || 5.0) - (a.averageRating || 5.0));
    } else if (sortBy === "experience-desc") {
      sorted.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
    } else if (sortBy === "name-asc") {
      sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }
    return sorted;
  };

  return (
    <div className="fade-in-section">
      {/* Hero Section */}
      <div className="doctor-dash-hero" style={{ marginBottom: "2rem" }}>
        <div className="doctor-dash-hero-text">
          <h1>🔍 Find Your Doctor</h1>
          <p>Search by name, filter by specialties, and sort by ratings or experience to find the perfect healthcare partner.</p>
        </div>
        <div className="doctor-dash-hero-emoji">🩺</div>
      </div>

      {/* Filter Row */}
      <div className="glass-card" style={{ marginBottom: "2rem", padding: "20px 24px" }}>
        <h4 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
          ⚙️ Search & Filter Parameters
        </h4>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1", minWidth: "200px" }}>
            <input
              type="text"
              placeholder="🔍 Search by name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              onKeyDown={(e) => e.key === "Enter" && searchDoctors()}
              style={{ margin: 0, padding: "12px 16px", borderRadius: "12px" }}
            />
          </div>
          
          <CustomSelect
            value={specialty}
            onChange={handleSpecialtyChange}
            options={[
              { value: "", label: "All Specialties" },
              ...allSpecialties.map(spec => ({ value: spec, label: spec }))
            ]}
            placeholder="All Specialties"
            icon="🩺"
            id="doc-specialty-filter"
          />

          <CustomSelect
            value={availability}
            onChange={handleAvailabilityChange}
            options={[
              { value: "", label: "All Availabilities" },
              { value: "true", label: "Available Now" },
              { value: "false", label: "Currently Busy" }
            ]}
            placeholder="All Availabilities"
            icon="🟢"
            id="doc-availability-filter"
          />

          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "", label: "Sort By" },
              { value: "rating-desc", label: "Rating (High to Low)" },
              { value: "experience-desc", label: "Experience (High to Low)" },
              { value: "name-asc", label: "Name (A - Z)" }
            ]}
            placeholder="Sort By"
            icon="↕️"
            id="doc-sort-filter"
          />

          <button onClick={() => searchDoctors()} className="btn-primary" style={{ height: "46px", borderRadius: "12px" }}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="glass-card">
        <h3 style={{ marginBottom: "1.5rem" }}>📋 Available Medical Professionals ({doctors.length})</h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            <p>Loading medical catalog...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "10px" }}>🔍</span>
            <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>No doctors found matching your criteria</p>
            <p style={{ fontSize: "0.82rem", marginTop: "2px" }}>Try broadening your search term or adjusting filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table-medcare">
              <thead>
                <tr>
                  <th>Doctor Info</th>
                  <th>Clinical Focus</th>
                  <th>Medical Institution</th>
                  <th>Availability</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {getSortedDoctors().map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div className="profile-cell-medcare">
                        <div className="avatar-circle-medcare">
                          {doc.profilePhoto ? (
                            <img src={doc.profilePhoto} alt="Doctor" />
                          ) : (
                            doc.fullName ? doc.fullName[0].toUpperCase() : "D"
                          )}
                        </div>
                        <div className="stacked-info-medcare">
                          <span className="title">Dr. {doc.fullName}</span>
                          <span className="subtitle">
                            🎓 {doc.qualifications || "Specialist"} ({doc.yearsOfExperience || 0} yrs exp)
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="stacked-info-medcare">
                        <span className="title">{doc.specialty}</span>
                        <span className="subtitle">{doc.subSpecialty || "General focus"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stacked-info-medcare">
                        <span className="title" style={{ fontWeight: 600, color: "var(--text-body)" }}>
                          {doc.medicalSchool || "Hospital Affiliate"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill-medcare ${doc.availability ? "success" : "danger"}`}>
                        <span className="status-dot"></span>
                        {doc.availability ? "Available" : "Busy"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 700, color: "#F59E0B" }}>
                        ⭐ {doc.averageRating ? doc.averageRating.toFixed(1) : "5.0"}
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>
                          ({doc.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorSearch;
