import express from "express";
import { getStatistics } from "../controllers/statisticsController.js";

const router = express.Router();

router.get("/stats", getStatistics);

export default router;
