import express from "express";
import * as medicineController from "../Controllers/medicineController.js";

const router = express.Router();

// Stock alert routes (specific paths before :id)
router.get("/low-stock", medicineController.getLowStockMedicines);
router.get("/expired", medicineController.getExpiredMedicines);
router.get("/near-expiry", medicineController.getNearExpiryMedicines);

// CRUD routes
router.post("/", medicineController.addMedicine);
router.get("/", medicineController.getMedicines);
router.get("/:id", medicineController.getMedicineById);
router.put("/:id", medicineController.updateMedicine);
router.delete("/:id", medicineController.deleteMedicine);

export default router;
