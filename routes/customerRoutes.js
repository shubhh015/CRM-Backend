import express from "express";
import {
    addCustomer,
    deleteCustomer,
    getCustomerById,
    getCustomers,
    updateCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

router.post("/", addCustomer);
router.get("/", getCustomers);
router.get("/:customerId", getCustomerById);
router.put("/:customerId", updateCustomer);
router.delete("/:customerId", deleteCustomer);

export default router;
