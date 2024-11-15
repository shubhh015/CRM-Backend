import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import Segment from "../models/Segment.js";

export const getStatistics = async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();

        const totalSegments = await Segment.countDocuments();

        const totalCampaigns = await Campaign.countDocuments();

        res.json({
            totalCustomers,
            totalSegments,
            totalCampaigns,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
