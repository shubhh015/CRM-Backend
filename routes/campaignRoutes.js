import express from "express";
import {
    createCampaign,
    getActiveCampaigns,
    getAllCampaigns,
    getCampaignStats,
    getCampaignsWithCounts,
    getPastCampaigns,
    updateCampaignState,
    updateCampaignStatus,
} from "../controllers/campaignController.js";

const router = express.Router();

router.post("/", createCampaign);
router.get("/:campaignId/stats", getCampaignStats);
router.get("/past", getPastCampaigns);
router.put("/:campaignId/state", updateCampaignState);
router.put("/:campaignId/status", updateCampaignStatus);
router.get("/all", getAllCampaigns);
router.get("/count", getCampaignsWithCounts);
router.get("/active", getActiveCampaigns);
export default router;
