import React, { useEffect } from "react";

function LandingPage({ setPage }) {
  useEffect(() => {
    /* ── Counter Animation ── */
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute("data-target"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 2000;
      const steps = 80;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      }, duration / steps);
    };

    /* ── Progress Ring Animation ── */
    const ring = document.querySelector(".progress-ring-fill");
    if (ring) {
      const circumference = 2 * Math.PI * 52;
      ring.style.strokeDasharray = `${circumference}`;
      ring.style.strokeDashoffset = `${circumference}`;
      setTimeout(() => {
        ring.style.strokeDashoffset = `${circumference * (1 - 0.72)}`;
      }, 600);
    }

    /* ── Sparkline Reveal ── */
    const sparklines = document.querySelectorAll(".sparkline-line");
    sparklines.forEach((line) => {
      line.style.clipPath = "inset(0 0 0 0)";
    });

    /* ── Intersection Observer for Scroll Reveals ── */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");

            // Animate counters inside this revealed element
            const counters = entry.target.querySelectorAll("[data-target]");
            counters.forEach((counter) => {
              if (!counter.classList.contains("counted")) {
                counter.classList.add("counted");
                animateCounter(counter);
              }
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    /* ── Smooth Scroll for Anchor Links ── */
    const handleAnchorClick = (e) => {
      const href = e.target.closest("a")?.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return (
    <div className="landing-page">
      {/* ══════════════════════════════════════
          NAVIGATION
          ══════════════════════════════════════ */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="nav-brand">
            <div className="brand-icon">🏥</div>
            <span className="brand-name">PrimaCure</span>
          </div>
          <ul className="nav-links-list">
            <li><a href="#overview">Overview</a></li>
            <li><a href="#analytics">Analytics</a></li>
            <li><a href="#departments">Departments</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="nav-actions">
            <button className="btn-nav-ghost" onClick={() => setPage("login")}>
              Sign In
            </button>
            <button className="btn-nav-primary" onClick={() => setPage("register")}>
              Launch Patient Portal
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════ */}
      <section className="lp-hero" id="overview">
        {/* Left Column — Copy & CTAs */}
        <div className="hero-left">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Next-Gen PrimaCure Platform
          </div>

          <h1 className="lp-hero-title">
            Operational Clarity,
            <br />
            <span className="hero-title-accent">Smarter Healthcare</span>
            <br />
            Management
          </h1>

          <p className="hero-sub">
            Streamline patient care, automate clinical workflows, and unlock
            real-time operational insights with our intelligent PrimaCure
            platform.
          </p>

          <div className="hero-ctas">
            <button
              className="btn-hero-primary"
              onClick={() => setPage("register")}
            >
              Book an Appointment
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              className="btn-hero-secondary"
              onClick={() => setPage("login")}
            >
              Explore Dashboard
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Specialist Doctors</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">50k+</span>
              <span className="stat-label">Happy Patients</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Emergency Care</span>
            </div>
          </div>
        </div>

        {/* Right Column — 3D Canvas */}
        <div className="hero-right">
          <div className="hero-3d-canvas">
            {/* Ambient glow orbs */}
            <div className="glow-orb glow-orb-1"></div>
            <div className="glow-orb glow-orb-2"></div>
            <div className="glow-orb glow-orb-3"></div>

            {/* Main floating doctor card */}
            <div className="float-card-main">
              <div className="fc-header">
                <div
                  className="fc-avatar"
                  style={{
                    background: "linear-gradient(135deg, #2552F0, #708DDC)",
                  }}
                >
                  SC
                </div>
                <div className="fc-info">
                  <div className="fc-name">Dr. Sarah Chen</div>
                  <div className="fc-dept">Cardiology Dept.</div>
                </div>
                <div className="fc-status">● Active</div>
              </div>
              <div className="fc-metric-row">
                <span className="fc-metric-label">Heart Rate</span>
                <span className="fc-metric-value">72 BPM</span>
              </div>
              <svg className="heartbeat-svg" viewBox="0 0 260 50">
                <path
                  className="heartbeat-path"
                  d="M0,25 L40,25 L55,25 L65,8 L75,42 L85,25 L110,25 L120,25 L130,5 L140,45 L150,25 L180,25 L190,25 L200,10 L210,40 L220,25 L260,25"
                  fill="none"
                  stroke="#2552F0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Floating notification pills */}
            <div className="float-pill float-pill-1">
              <span className="pill-dot pill-dot-green"></span>
              Prescription Sent
            </div>
            <div className="float-pill float-pill-2">
              <span className="pill-dot pill-dot-blue"></span>
              Lab Report Ready
            </div>

            {/* Floating capsules */}
            <div className="capsule capsule-1"></div>
            <div className="capsule capsule-2"></div>

            {/* Floating emoji decorations */}
            <div className="float-emoji float-emoji-1">🩺</div>
            <div className="float-emoji float-emoji-2">💊</div>
            <div className="float-emoji float-emoji-3">❤️</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ANALYTICS GRID
          ══════════════════════════════════════ */}
      <section className="lp-analytics" id="analytics">
        <div className="section-header reveal">
          <div className="section-badge">📊 Real-Time Analytics</div>
          <h2>PrimaCure Operational Telemetry</h2>
          <p>Live dashboard metrics from our PrimaCure platform</p>
        </div>

        <div className="analytics-grid">
          {/* ── Card 1: Total Patients ── */}
          <div className="analytics-card reveal">
            <div className="card-top">
              <div className="card-icon card-icon-blue">👥</div>
              <span className="card-badge card-badge-up">↑ 12.5%</span>
            </div>
            <div className="card-counter" data-target="15847">
              0
            </div>
            <div className="card-label">Total Patients</div>
            <svg className="sparkline-svg" viewBox="0 0 200 60">
              <defs>
                <linearGradient
                  id="sparkGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="rgba(37,82,240,0.15)" />
                  <stop offset="100%" stopColor="rgba(37,82,240,0)" />
                </linearGradient>
              </defs>
              <polygon
                className="sparkline-line"
                points="0,48 20,44 40,46 60,38 80,40 100,28 120,32 140,22 160,18 180,14 200,16 200,60 0,60"
                fill="url(#sparkGrad)"
                stroke="none"
              />
              <polyline
                className="sparkline-line"
                points="0,48 20,44 40,46 60,38 80,40 100,28 120,32 140,22 160,18 180,14 200,16"
                fill="none"
                stroke="#2552F0"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* ── Card 2: Active Appointments ── */}
          <div className="analytics-card reveal">
            <div className="card-top">
              <div className="card-icon card-icon-green">📅</div>
              <span className="card-badge card-badge-up">↑ 8.3%</span>
            </div>
            <div className="card-counter" data-target="284">
              0
            </div>
            <div className="card-label">Active Appointments</div>
            <div className="appt-timeline">
              <div className="appt-slot">
                <div className="appt-left">
                  <div className="appt-avatars">
                    <div
                      className="appt-avatar"
                      style={{
                        background:
                          "linear-gradient(135deg, #2552F0, #708DDC)",
                      }}
                    >
                      SC
                    </div>
                    <div
                      className="appt-avatar"
                      style={{
                        background:
                          "linear-gradient(135deg, #CD7834, #e89a5a)",
                      }}
                    >
                      AK
                    </div>
                  </div>
                  <span className="appt-name">Dr. Chen</span>
                </div>
                <span className="appt-time">09:00</span>
              </div>
              <div className="appt-slot">
                <div className="appt-left">
                  <div className="appt-avatars">
                    <div
                      className="appt-avatar"
                      style={{
                        background:
                          "linear-gradient(135deg, #22C55E, #6ee7b7)",
                      }}
                    >
                      MR
                    </div>
                    <div
                      className="appt-avatar"
                      style={{
                        background:
                          "linear-gradient(135deg, #8B5CF6, #a78bfa)",
                      }}
                    >
                      JD
                    </div>
                  </div>
                  <span className="appt-name">Dr. Rahman</span>
                </div>
                <span className="appt-time">10:30</span>
              </div>
              <div className="appt-slot">
                <div className="appt-left">
                  <div className="appt-avatars">
                    <div
                      className="appt-avatar"
                      style={{
                        background:
                          "linear-gradient(135deg, #EF4444, #f87171)",
                      }}
                    >
                      PL
                    </div>
                  </div>
                  <span className="appt-name">Dr. Patel</span>
                </div>
                <span className="appt-time">11:15</span>
              </div>
            </div>
          </div>

          {/* ── Card 3: Bed Occupancy ── */}
          <div className="analytics-card reveal">
            <div className="card-top">
              <div className="card-icon card-icon-orange">🛏️</div>
            </div>
            <div className="progress-ring-container">
              <svg className="progress-ring" viewBox="0 0 120 120">
                <circle
                  className="progress-ring-bg"
                  cx="60"
                  cy="60"
                  r="52"
                />
                <circle
                  className="progress-ring-fill"
                  cx="60"
                  cy="60"
                  r="52"
                  strokeDasharray="326.73"
                  strokeDashoffset="326.73"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="progress-ring-text">
                <span className="ring-value">72%</span>
                <span className="ring-label">Occupied</span>
              </div>
            </div>
            <div className="card-label" style={{ textAlign: "center" }}>
              Bed Occupancy Status
            </div>
          </div>

          {/* ── Card 4: Lab & Diagnostics ── */}
          <div className="analytics-card reveal">
            <div className="card-top">
              <div className="card-icon card-icon-purple">🧪</div>
            </div>
            <div
              className="card-label"
              style={{
                marginBottom: "16px",
                fontWeight: 700,
                color: "#070607",
                fontSize: "0.95rem",
              }}
            >
              Lab &amp; Diagnostics
            </div>
            <div className="lab-pipeline">
              <div className="pipeline-item">
                <div className="pipeline-dot pipeline-done"></div>
                <span className="pipeline-label">Sample Collected</span>
                <span className="pipeline-badge badge-done">Done</span>
              </div>
              <div className="pipeline-item">
                <div className="pipeline-dot pipeline-active"></div>
                <span className="pipeline-label">In Lab</span>
                <span className="pipeline-badge badge-active">Processing</span>
              </div>
              <div className="pipeline-item">
                <div className="pipeline-dot pipeline-pending"></div>
                <span className="pipeline-label">Report Ready</span>
                <span className="pipeline-badge badge-pending">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DEPARTMENT DIRECTORY / FEATURES
          ══════════════════════════════════════ */}
      <section className="lp-features" id="departments">
        <div className="section-header reveal">
          <div className="section-badge">🏢 Department Directory</div>
          <h2>Comprehensive Healthcare Services</h2>
          <p>World-class medical departments powered by PrimaCure</p>
        </div>

        <div className="features-grid">
          <div className="feature-card reveal">
            <div
              className="feature-icon"
              style={{ background: "rgba(37,82,240,0.08)" }}
            >
              🫀
            </div>
            <h3>Cardiology</h3>
            <p>
              Advanced cardiac care with real-time patient monitoring and ECG
              analytics integration.
            </p>
          </div>
          <div className="feature-card reveal">
            <div
              className="feature-icon"
              style={{ background: "rgba(34,197,94,0.08)" }}
            >
              🧬
            </div>
            <h3>Neurology</h3>
            <p>
              Cutting-edge neurological diagnostics with AI-assisted scan
              interpretation and reporting.
            </p>
          </div>
          <div className="feature-card reveal">
            <div
              className="feature-icon"
              style={{ background: "rgba(205,120,52,0.08)" }}
            >
              🦴
            </div>
            <h3>Orthopedics</h3>
            <p>
              Digital imaging, surgical planning, and rehabilitation tracking in
              one unified system.
            </p>
          </div>
          <div className="feature-card reveal">
            <div
              className="feature-icon"
              style={{ background: "rgba(139,92,246,0.08)" }}
            >
              👶
            </div>
            <h3>Pediatrics</h3>
            <p>
              Child-specific health records, vaccination schedules, and growth
              analytics dashboards.
            </p>
          </div>
          <div className="feature-card reveal">
            <div
              className="feature-icon"
              style={{ background: "rgba(236,72,153,0.08)" }}
            >
              🔬
            </div>
            <h3>Pathology</h3>
            <p>
              Automated lab workflows, sample tracking, and instant digital
              report delivery to patients.
            </p>
          </div>
          <div className="feature-card reveal">
            <div
              className="feature-icon"
              style={{ background: "rgba(20,184,166,0.08)" }}
            >
              💊
            </div>
            <h3>Pharmacy</h3>
            <p>
              Real-time inventory management, e-prescriptions, and automated
              drug interaction alerts.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA SECTION
          ══════════════════════════════════════ */}
      <section className="lp-cta reveal">
        <div className="cta-card">
          <h2>Ready to Transform Your Healthcare?</h2>
          <p>
            Join thousands of healthcare professionals using PrimaCure to
            deliver better patient outcomes.
          </p>
          <button className="btn-cta" onClick={() => setPage("register")}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
          ══════════════════════════════════════ */}
      <footer className="lp-footer" id="contact">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <div className="footer-brand-icon">🏥</div>
              <span className="footer-brand-text">PrimaCure</span>
            </div>
            <p className="footer-desc">
              Next-generation PrimaCure platform delivering
              operational clarity and smarter healthcare outcomes.
            </p>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="#overview">Overview</a>
            <a href="#analytics">Analytics</a>
            <a href="#departments">Departments</a>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("login");
              }}
            >
              Patient Portal
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("register");
              }}
            >
              Create Account
            </a>
            <a href="#contact">Support</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">HIPAA Compliance</a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 PrimaCure. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
