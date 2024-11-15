import express from "express";
import { updateDeliveryStatus } from "../controllers/deliveryController.js";

const router = express.Router();

router.post("/status", updateDeliveryStatus);

export default router;
