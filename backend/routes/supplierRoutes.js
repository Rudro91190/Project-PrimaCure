import express from "express";
import * as supplierController from "../Controllers/supplierController.js";

const router = express.Router();

router.post("/", supplierController.addSupplier);
router.get("/", supplierController.getSuppliers);
router.delete("/:id", supplierController.deleteSupplier);

export default router;
