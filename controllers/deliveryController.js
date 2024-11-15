import CommunicationLog from "../models/CommunicationLog.js";
import { updateCampaignStatus } from "./campaignController.js";

export const updateDeliveryStatus = async (req, res) => {
    try {
        const { logId, status } = req.body;

        if (!["SENT", "FAILED"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const log = await CommunicationLog.findById(logId);
        if (!log) {
            return res
                .status(404)
                .json({ message: "Communication log not found" });
        }

        log.status = status;
        await log.save();
        await updateCampaignStatus(logId);
        res.json({
            message: "Status updated successfully",
            status: log.status,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
