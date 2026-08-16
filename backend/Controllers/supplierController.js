import Supplier from "../models/Supplier.js";

// Add a new supplier
export const addSupplier = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const supplier = new Supplier({ name, phone, address });
    await supplier.save();
    res.status(201).json({ message: "Supplier added successfully", supplier });
  } catch (err) {
    res.status(500).json({ message: "Error adding supplier", error: err.message });
  }
};

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching suppliers", error: err.message });
  }
};

// Delete a supplier
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting supplier", error: err.message });
  }
};
