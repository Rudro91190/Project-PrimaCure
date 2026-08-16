import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const TABS = ["Catalog", "Add Medicine", "Suppliers", "Alerts"];

function MedicineCatalog() {
  const [activeTab, setActiveTab] = useState("Catalog");

  // --- Catalog state ---
  const [medicines, setMedicines] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [editMed, setEditMed] = useState(null);

  // --- Add Medicine form ---
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    expiryDate: "",
    supplierId: "",
  });
  const [formMsg, setFormMsg] = useState("");

  // --- Suppliers state ---
  const [suppliers, setSuppliers] = useState([]);
  const [supForm, setSupForm] = useState({ name: "", phone: "", address: "" });
  const [supMsg, setSupMsg] = useState("");

  // --- Alerts state ---
  const [lowStock, setLowStock] = useState([]);
  const [expired, setExpired] = useState([]);
  const [nearExpiry, setNearExpiry] = useState([]);

  useEffect(() => {
    fetchMedicines();
    fetchSuppliers();
    fetchAlerts();
    fetchAllCategories();
  }, []);

  const fetchAllCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/catalog`);
      const cats = res.data.map(m => m.category).filter(Boolean);
      const uniqueCats = [...new Set(cats)];
      setAllCategories(uniqueCats);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const fetchMedicines = async () => {
    setLoadingMeds(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const res = await axios.get(`${API}/api/catalog`, { params });
      setMedicines(res.data);
    } catch (err) {
      console.error("Error fetching medicines", err);
    } finally {
      setLoadingMeds(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API}/api/suppliers`);
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers", err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const [ls, ex, ne] = await Promise.all([
        axios.get(`${API}/api/catalog/low-stock`),
        axios.get(`${API}/api/catalog/expired`),
        axios.get(`${API}/api/catalog/near-expiry`),
      ]);
      setLowStock(ls.data);
      setExpired(ex.data);
      setNearExpiry(ne.data);
    } catch (err) {
      console.error("Error fetching alerts", err);
    }
  };

  // Search on enter or button
  const handleSearch = () => {
    fetchMedicines();
  };

  const handleCategoryChange = async (cat) => {
    setCategoryFilter(cat);
    setLoadingMeds(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (cat) params.category = cat;
      const res = await axios.get(`${API}/api/catalog`, { params });
      setMedicines(res.data);
    } catch (err) {
      console.error("Error fetching medicines", err);
    } finally {
      setLoadingMeds(false);
    }
  };

  const getSortedMedicines = () => {
    const sorted = [...medicines];
    if (sortBy === "name-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "quantity-asc") {
      sorted.sort((a, b) => a.quantity - b.quantity);
    } else if (sortBy === "quantity-desc") {
      sorted.sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === "expiry-asc") {
      sorted.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    } else if (sortBy === "expiry-desc") {
      sorted.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
    }
    return sorted;
  };

  // Add / Update medicine
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormMsg("");
    try {
      if (editMed) {
        await axios.put(`${API}/api/catalog/${editMed._id}`, form);
        setFormMsg("✅ Medicine updated successfully!");
        setEditMed(null);
      } else {
        await axios.post(`${API}/api/catalog`, form);
        setFormMsg("✅ Medicine added successfully!");
      }
      setForm({ name: "", category: "", price: "", quantity: "", expiryDate: "", supplierId: "" });
      fetchMedicines();
      fetchAlerts();
      fetchAllCategories();
    } catch (err) {
      setFormMsg("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (med) => {
    setEditMed(med);
    setForm({
      name: med.name,
      category: med.category,
      price: med.price,
      quantity: med.quantity,
      expiryDate: med.expiryDate?.slice(0, 10),
      supplierId: med.supplierId?._id || "",
    });
    setActiveTab("Add Medicine");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;
    try {
      await axios.delete(`${API}/api/catalog/${id}`);
      fetchMedicines();
      fetchAlerts();
      fetchAllCategories();
    } catch (err) {
      alert("Error deleting medicine");
    }
  };

  // Add supplier
  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    setSupMsg("");
    try {
      await axios.post(`${API}/api/suppliers`, supForm);
      setSupMsg("✅ Supplier added successfully!");
      setSupForm({ name: "", phone: "", address: "" });
      fetchSuppliers();
    } catch (err) {
      setSupMsg("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await axios.delete(`${API}/api/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert("Error deleting supplier");
    }
  };

  const isLowStock = (qty) => qty < 10;
  const isExpired = (date) => new Date(date) < new Date();
  const isNearExpiry = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  };

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>💊 Medicine Catalog & Stock Management</h3>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab ? styles.tabBtnActive : {}),
            }}
          >
            {tab}
            {tab === "Alerts" && lowStock.length + expired.length + nearExpiry.length > 0 && (
              <span style={styles.alertBadge}>
                {lowStock.length + expired.length + nearExpiry.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CATALOG TAB ── */}
      {activeTab === "Catalog" && (
        <div>
          <div style={styles.searchRow}>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={styles.searchInput}
              id="med-search"
            />
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="select-inline-premium"
              style={{ marginTop: 0 }}
              id="med-category-filter"
            >
              <option value="">📁 All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-inline-premium"
              style={{ marginTop: 0 }}
              id="med-sort"
            >
              <option value="">↕️ Sort By</option>
              <option value="name-asc">🔤 Name (A - Z)</option>
              <option value="name-desc">🔤 Name (Z - A)</option>
              <option value="price-asc">💵 Price (Low to High)</option>
              <option value="price-desc">💵 Price (High to Low)</option>
              <option value="quantity-asc">📦 Quantity (Low to High)</option>
              <option value="quantity-desc">📦 Quantity (High to Low)</option>
              <option value="expiry-asc">📅 Expiry Date (Soonest First)</option>
              <option value="expiry-desc">📅 Expiry Date (Latest First)</option>
            </select>
            <button onClick={handleSearch} style={styles.searchBtn} id="med-search-btn">
              🔍 Search
            </button>
          </div>

          {loadingMeds ? (
            <p>Loading medicines...</p>
          ) : medicines.length === 0 ? (
            <p style={styles.empty}>No medicines found.</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Name", "Category", "Price", "Quantity", "Expiry Date", "Supplier", "Status", "Actions"].map(
                      (h) => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {getSortedMedicines().map((med) => {
                    const expired_ = isExpired(med.expiryDate);
                    const nearExp = isNearExpiry(med.expiryDate);
                    const lowSt = isLowStock(med.quantity);
                    return (
                      <tr key={med._id} style={expired_ ? styles.expiredRow : {}}>
                        <td style={styles.td}>{med.name}</td>
                        <td style={styles.td}>{med.category}</td>
                        <td style={styles.td}>৳{med.price}</td>
                        <td style={styles.td}>
                          {med.quantity}
                          {lowSt && (
                            <span style={styles.lowBadge}> 🔴 Low</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {med.expiryDate?.slice(0, 10)}
                          {expired_ && <span style={styles.expBadge}> ❌ Expired</span>}
                          {!expired_ && nearExp && (
                            <span style={styles.nearBadge}> 🟡 Near</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {med.supplierId ? med.supplierId.name : "—"}
                        </td>
                        <td style={styles.td}>
                          {med.quantity === 0 ? (
                            <span style={styles.outBadge}>Out of Stock</span>
                          ) : lowSt ? (
                            <span style={styles.lowStockText}>Low Stock</span>
                          ) : (
                            <span style={styles.inStockText}>In Stock</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleEdit(med)}
                            style={styles.editBtn}
                            id={`edit-med-${med._id}`}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(med._id)}
                            style={styles.deleteBtn}
                            id={`del-med-${med._id}`}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ADD / EDIT MEDICINE TAB ── */}
      {activeTab === "Add Medicine" && (
        <div style={styles.formCard}>
          <h4 style={styles.formTitle}>
            {editMed ? "✏️ Edit Medicine" : "➕ Add New Medicine"}
          </h4>
          {editMed && (
            <p style={styles.editNotice}>
              Editing: <strong>{editMed.name}</strong>{" "}
              <button
                onClick={() => {
                  setEditMed(null);
                  setForm({ name: "", category: "", price: "", quantity: "", expiryDate: "", supplierId: "" });
                  setFormMsg("");
                }}
                style={styles.cancelBtn}
                id="cancel-edit-btn"
              >
                Cancel Edit
              </button>
            </p>
          )}
          <form onSubmit={handleFormSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Medicine Name *</label>
                <input
                  id="med-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. Paracetamol 500mg"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <input
                  id="med-category"
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. Analgesic, Antibiotic"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (৳) *</label>
                <input
                  id="med-price"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. 50"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Quantity *</label>
                <input
                  id="med-quantity"
                  required
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. 100"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Expiry Date *</label>
                <input
                  id="med-expiry"
                  required
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Supplier (optional)</label>
                <select
                  id="med-supplier"
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  style={styles.input}
                >
                  <option value="">— Select Supplier —</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" style={styles.submitBtn} id="med-submit-btn">
              {editMed ? "💾 Update Medicine" : "➕ Add Medicine"}
            </button>
          </form>
          {formMsg && <p style={styles.msg}>{formMsg}</p>}
        </div>
      )}

      {/* ── SUPPLIERS TAB ── */}
      {activeTab === "Suppliers" && (
        <div>
          <div style={styles.formCard}>
            <h4 style={styles.formTitle}>➕ Add Supplier</h4>
            <form onSubmit={handleSupplierSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Supplier Name *</label>
                  <input
                    id="sup-name"
                    required
                    value={supForm.name}
                    onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                    style={styles.input}
                    placeholder="e.g. MediCorp Ltd"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone *</label>
                  <input
                    id="sup-phone"
                    required
                    value={supForm.phone}
                    onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                    style={styles.input}
                    placeholder="e.g. 01711-000000"
                  />
                </div>
                <div style={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Address *</label>
                  <input
                    id="sup-address"
                    required
                    value={supForm.address}
                    onChange={(e) => setSupForm({ ...supForm, address: e.target.value })}
                    style={styles.input}
                    placeholder="e.g. Dhaka, Bangladesh"
                  />
                </div>
              </div>
              <button type="submit" style={styles.submitBtn} id="sup-submit-btn">
                ➕ Add Supplier
              </button>
            </form>
            {supMsg && <p style={styles.msg}>{supMsg}</p>}
          </div>

          <h4 style={{ marginTop: 20, color: "#f76b1c" }}>All Suppliers</h4>
          {suppliers.length === 0 ? (
            <p style={styles.empty}>No suppliers added yet.</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Name", "Phone", "Address", "Action"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s._id}>
                      <td style={styles.td}>{s.name}</td>
                      <td style={styles.td}>{s.phone}</td>
                      <td style={styles.td}>{s.address}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleDeleteSupplier(s._id)}
                          style={styles.deleteBtn}
                          id={`del-sup-${s._id}`}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ALERTS TAB ── */}
      {activeTab === "Alerts" && (
        <div>
          {/* Low Stock */}
          <div style={styles.alertSection}>
            <h4 style={{ ...styles.alertHead, color: "#e63946" }}>
              🔴 Low Stock Medicines ({lowStock.length})
            </h4>
            {lowStock.length === 0 ? (
              <p style={styles.empty}>✅ No low stock medicines.</p>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Name", "Category", "Quantity", "Supplier"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((m) => (
                      <tr key={m._id}>
                        <td style={styles.td}>{m.name}</td>
                        <td style={styles.td}>{m.category}</td>
                        <td style={{ ...styles.td, color: "#e63946", fontWeight: 700 }}>
                          {m.quantity} {m.quantity === 0 && "⚠️ OUT OF STOCK"}
                        </td>
                        <td style={styles.td}>{m.supplierId?.name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Expired */}
          <div style={styles.alertSection}>
            <h4 style={{ ...styles.alertHead, color: "#6b1c1c" }}>
              ❌ Expired Medicines ({expired.length})
            </h4>
            {expired.length === 0 ? (
              <p style={styles.empty}>✅ No expired medicines.</p>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Name", "Category", "Expiry Date", "Supplier"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expired.map((m) => (
                      <tr key={m._id} style={styles.expiredRow}>
                        <td style={styles.td}>{m.name}</td>
                        <td style={styles.td}>{m.category}</td>
                        <td style={{ ...styles.td, color: "#e63946", fontWeight: 700 }}>
                          {m.expiryDate?.slice(0, 10)}
                        </td>
                        <td style={styles.td}>{m.supplierId?.name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Near Expiry */}
          <div style={styles.alertSection}>
            <h4 style={{ ...styles.alertHead, color: "#e07c00" }}>
              🟡 Near-Expiry Medicines — within 30 days ({nearExpiry.length})
            </h4>
            {nearExpiry.length === 0 ? (
              <p style={styles.empty}>✅ No near-expiry medicines.</p>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Name", "Category", "Expiry Date", "Supplier"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nearExpiry.map((m) => (
                      <tr key={m._id}>
                        <td style={styles.td}>{m.name}</td>
                        <td style={styles.td}>{m.category}</td>
                        <td style={{ ...styles.td, color: "#e07c00", fontWeight: 700 }}>
                          {m.expiryDate?.slice(0, 10)}
                        </td>
                        <td style={styles.td}>{m.supplierId?.name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = {
  wrapper: {
    marginTop: 24,
    background: "#fff",
    borderRadius: 14,
    padding: "20px 16px",
    border: "1px solid #f3e9e9",
    boxShadow: "0 4px 16px rgba(247,107,28,0.08)",
  },
  title: {
    color: "var(--primary)",
    textAlign: "center",
    marginBottom: 16,
    fontSize: "1.2rem",
  },
  tabBar: {
    display: "flex",
    gap: 6,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  tabBtn: {
    flex: 1,
    padding: "8px 0",
    borderRadius: 8,
    border: "1.5px solid var(--primary)",
    background: "#fff",
    color: "var(--primary)",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    position: "relative",
  },
  tabBtnActive: {
    background: "var(--primary-gradient)",
    color: "#fff",
    border: "none",
  },
  alertBadge: {
    background: "#e63946",
    color: "#fff",
    borderRadius: "50%",
    fontSize: "0.7rem",
    padding: "1px 5px",
    marginLeft: 4,
  },
  searchRow: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    padding: "8px 10px",
    border: "1px solid #e0e0e0",
    borderRadius: 7,
    fontSize: "0.9rem",
    minWidth: 120,
  },
  searchBtn: {
    padding: "8px 16px",
    background: "var(--primary-gradient)",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 600,
    width: "auto",
    fontSize: "0.9rem",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.85rem",
  },
  th: {
    background: "#f0f9ff",
    color: "var(--primary)",
    padding: "8px 10px",
    textAlign: "left",
    borderBottom: "2px solid var(--secondary)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "7px 10px",
    borderBottom: "1px solid #f5f5f5",
    verticalAlign: "middle",
  },
  expiredRow: {
    background: "#fff0f0",
  },
  lowBadge: {
    color: "#e63946",
    fontWeight: 700,
    fontSize: "0.8rem",
  },
  expBadge: {
    color: "#e63946",
    fontWeight: 700,
    fontSize: "0.8rem",
  },
  nearBadge: {
    color: "#e07c00",
    fontWeight: 700,
    fontSize: "0.8rem",
  },
  outBadge: {
    background: "#e63946",
    color: "#fff",
    borderRadius: 4,
    padding: "2px 6px",
    fontSize: "0.78rem",
    fontWeight: 700,
  },
  lowStockText: {
    color: "#e63946",
    fontWeight: 600,
    fontSize: "0.82rem",
  },
  inStockText: {
    color: "var(--accent)",
    fontWeight: 600,
    fontSize: "0.82rem",
  },
  editBtn: {
    padding: "4px 10px",
    background: "var(--secondary)",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    marginRight: 4,
    fontSize: "0.8rem",
    width: "auto",
  },
  deleteBtn: {
    padding: "4px 10px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: "0.8rem",
    width: "auto",
  },
  formCard: {
    background: "#f8fafc",
    borderRadius: 10,
    padding: "16px 14px",
    border: "1px solid #e2e8f0",
    marginBottom: 16,
  },
  formTitle: {
    color: "var(--primary)",
    marginBottom: 12,
    marginTop: 0,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px 14px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#444",
    marginBottom: 3,
  },
  input: {
    padding: "8px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: 7,
    fontSize: "0.9rem",
    background: "#fff",
  },
  submitBtn: {
    marginTop: 14,
    padding: "10px 0",
    background: "var(--primary-gradient)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "1rem",
    width: "100%",
  },
  cancelBtn: {
    marginLeft: 8,
    padding: "2px 10px",
    background: "#e2e8f0",
    color: "#475569",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: "0.82rem",
    width: "auto",
  },
  editNotice: {
    background: "var(--bg-color)",
    padding: "6px 10px",
    borderRadius: 6,
    fontSize: "0.88rem",
    marginBottom: 10,
    border: "1px solid var(--secondary)",
  },
  msg: {
    marginTop: 10,
    padding: 8,
    borderRadius: 6,
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #dcfce7",
    textAlign: "center",
    fontSize: "0.9rem",
  },
  empty: {
    color: "#999",
    textAlign: "center",
    padding: 20,
    fontSize: "0.9rem",
  },
  alertSection: {
    marginBottom: 20,
  },
  alertHead: {
    marginBottom: 8,
    fontSize: "1rem",
  },
};

export default MedicineCatalog;
