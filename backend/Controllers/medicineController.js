import CatalogMedicine from "../models/CatalogMedicine.js";

const LOW_STOCK_THRESHOLD = 10;
const NEAR_EXPIRY_DAYS = 30;

// Add a new medicine to the catalog
export const addMedicine = async (req, res) => {
  try {
    const { name, category, price, quantity, expiryDate, supplierId } = req.body;
    const medicine = new CatalogMedicine({
      name,
      category,
      price,
      quantity,
      expiryDate,
      supplierId: supplierId || null,
    });
    await medicine.save();
    res.status(201).json({ message: "Medicine added successfully", medicine });
  } catch (err) {
    res.status(500).json({ message: "Error adding medicine", error: err.message });
  }
};

// Get all medicines (supports ?search=name&category=cat)
export const getMedicines = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    const medicines = await CatalogMedicine.find(filter)
      .populate("supplierId", "name phone address")
      .sort({ createdAt: -1 });

    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Error fetching medicines", error: err.message });
  }
};

// Get a single medicine by ID
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await CatalogMedicine.findById(req.params.id).populate(
      "supplierId",
      "name phone address"
    );
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: "Error fetching medicine", error: err.message });
  }
};

// Update medicine details
export const updateMedicine = async (req, res) => {
  try {
    const { name, category, price, quantity, expiryDate, supplierId } = req.body;
    const medicine = await CatalogMedicine.findByIdAndUpdate(
      req.params.id,
      { name, category, price, quantity, expiryDate, supplierId },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json({ message: "Medicine updated successfully", medicine });
  } catch (err) {
    res.status(500).json({ message: "Error updating medicine", error: err.message });
  }
};

// Delete a medicine
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await CatalogMedicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting medicine", error: err.message });
  }
};

// Get low stock medicines (quantity below threshold)
export const getLowStockMedicines = async (req, res) => {
  try {
    const medicines = await CatalogMedicine.find({
      quantity: { $lt: LOW_STOCK_THRESHOLD },
    }).populate("supplierId", "name phone");
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Error fetching low stock medicines", error: err.message });
  }
};

// Get expired medicines
export const getExpiredMedicines = async (req, res) => {
  try {
    const today = new Date();
    const medicines = await CatalogMedicine.find({
      expiryDate: { $lt: today },
    }).populate("supplierId", "name phone");
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expired medicines", error: err.message });
  }
};

// Get near-expiry medicines (expiring within 30 days)
export const getNearExpiryMedicines = async (req, res) => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + NEAR_EXPIRY_DAYS);

    const medicines = await CatalogMedicine.find({
      expiryDate: { $gte: today, $lte: futureDate },
    }).populate("supplierId", "name phone");
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Error fetching near-expiry medicines", error: err.message });
  }
};
