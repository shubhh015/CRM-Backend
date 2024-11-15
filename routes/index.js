import express from "express";

import { authenticateUser } from "../middleware/authMiddleware.js";
import campaignRoutes from "./campaignRoutes.js";
import customerRoutes from "./customerRoutes.js";
import deliveryRoutes from "./deliveryRoutes.js";
import orderRoutes from "./orderRoutes.js";
import segmentRoutes from "./segmentRoutes.js";
import statRoutes from "./statRoutes.js";
const router = express.Router();

router.use("/customers", authenticateUser, customerRoutes);
router.use("/segments", authenticateUser, segmentRoutes);
router.use("/campaigns", authenticateUser, campaignRoutes);
router.use("/delivery", authenticateUser, deliveryRoutes);
router.use("/statistics", authenticateUser, statRoutes);
router.use("/orders", authenticateUser, orderRoutes);
export default router;
