import Campaign from "../models/Campaign.js";
import CommunicationLog from "../models/CommunicationLog.js";
import Customer from "../models/Customer.js";
import Segment from "../models/Segment.js";
import { sendMessageToQueue } from "../utils/messageProducer.js";

export const createCampaign = async (req, res) => {
    try {
        const { title, segmentId, userId } = req.body;

        const segment = await Segment.findById(segmentId);
        if (!segment) {
            return res.status(404).json({ message: "Segment not found" });
        }

        const campaign = await Campaign.create({
            userId,
            title,
            segmentId,
        });

        const { conditions, logic } = segment;
        const queryConditions = conditions
            .map((condition) => {
                const { field, operator, value } = condition;
                switch (operator) {
                    case ">":
                        return { [field]: { $gt: value } };
                    case "<":
                        return { [field]: { $lt: value } };
                    case ">=":
                        return { [field]: { $gte: value } };
                    case "<=":
                        return { [field]: { $lte: value } };
                    case "=":
                        return { [field]: value };
                    default:
                        return null;
                }
            })
            .filter(Boolean);

        let filterQuery = {};
        if (logic === "OR") {
            filterQuery = { $or: queryConditions };
        } else {
            filterQuery = { $and: queryConditions };
        }

        const audience = await Customer.find(filterQuery);
        await campaign.save();
        const logs = [];

        for (const customer of audience) {
            const personalizedMessage = `Hi ${customer.name}, ${title}`;

            const log = await CommunicationLog.create({
                campaignId: campaign._id,
                customerId: customer._id,
                message: personalizedMessage,
            });
            logs.push(log);

            await sendMessageToQueue({ logId: log._id });
        }
        console.log("customer");
        res.status(201).json({
            campaignId: campaign._id,
            title: title,
            segmentId: segmentId,
            audienceSize: audience.length,
            logs: logs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getCampaignStats = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaign = await Campaign.findById(campaignId).populate(
            "segmentId"
        );

        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        const logs = await CommunicationLog.find({ campaignId });

        const sentCount = logs.filter((log) => log.status === "SENT").length;
        const failedCount = logs.filter(
            (log) => log.status === "FAILED"
        ).length;
        const totalMessages = logs.length;

        const responseRate = sentCount / totalMessages;

        res.json({
            campaignId: campaign._id,
            title: campaign.title,
            audienceSize: totalMessages,
            sentCount,
            failedCount,
            responseRate,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const updateCampaignStatus = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaign = await Campaign.findById(campaignId);

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        const logs = await CommunicationLog.find({ campaignId });

        const hasFailed = logs.some((log) => log.status === "FAILED");

        if (hasFailed) {
            campaign.status = "FAILED";
        } else {
            campaign.status = "SENT";
        }

        await campaign.save();
        res.status(200).json({
            message: `Campaign status updated to ${campaign.status}`,
            campaign: {
                id: campaign._id,
                title: campaign.title,
                segmentId: campaign.segmentId,
                status: campaign.status,
                state: campaign.state,
                createdAt: campaign.createdAt,
                updatedAt: campaign.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error updating campaign status:", error);
    }
};

export const getPastCampaigns = async (req, res) => {
    try {
        const userId = req.query.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const campaigns = await Campaign.find({ userId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate("segmentId", "name");

        if (campaigns.length === 0) {
            return res.status(404).json({ message: "No past campaigns found" });
        }

        const totalCampaigns = await Campaign.countDocuments({ userId });

        const campaignsWithStats = await Promise.all(
            campaigns.map(async (campaign) => {
                const logs = await CommunicationLog.find({
                    campaignId: campaign._id,
                });

                const sentCount = logs.filter(
                    (log) => log.status === "SENT"
                ).length;
                const failedCount = logs.filter(
                    (log) => log.status === "FAILED"
                ).length;

                return {
                    ...campaign._doc,
                    segmentTitle: campaign.segmentId?.name || "N/A",
                    sentCount,
                    failedCount,
                    audienceSize: logs.length,
                    status: sentCount === logs.length ? "SENT" : "PENDING",
                    state: campaign.state,
                    createdAt: campaign.createdAt,
                };
            })
        );

        res.json({
            campaigns: campaignsWithStats,
            pagination: {
                totalCampaigns,
                totalPages: Math.ceil(totalCampaigns / limit),
                currentPage: page,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate("segmentId");

        if (campaigns.length === 0) {
            return res.status(404).json({ message: "No campaigns found" });
        }

        res.json({ campaigns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const updateCampaignState = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { state, userId } = req.body;

        if (state !== "ACTIVE" && state !== "CLOSED") {
            return res.status(400).json({ message: "Invalid state" });
        }

        const campaign = await Campaign.findOne({
            _id: campaignId,
        });
        if (!campaign) {
            return res
                .status(404)
                .json({ message: "Campaign not found or unauthorized" });
        }
        campaign.userId = userId;
        campaign.state = state;

        await campaign.save();

        res.status(200).json({
            message: `Campaign state updated to ${state}`,
            campaign: {
                id: campaign._id,
                title: campaign.title,
                state: campaign.state,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getActiveCampaigns = async (req, res) => {
    try {
        const activeCampaigns = await Campaign.find({
            state: "ACTIVE",
        }).populate("segmentId");

        if (activeCampaigns.length === 0) {
            return res
                .status(404)
                .json({ message: "No active campaigns found" });
        }

        res.json({ activeCampaigns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getCampaignsWithCounts = async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate("segmentId");

        if (campaigns.length === 0) {
            return res.status(404).json({ message: "No campaigns found" });
        }
        const openCount = campaigns.filter(
            (campaign) => campaign.state === "ACTIVE"
        ).length;

        const closedCount = campaigns.filter(
            (campaign) => campaign.state === "CLOSED"
        ).length;
        const sentCampaignCount = campaigns.filter(
            (campaign) => campaign.status === "SENT"
        ).length;

        const pendingCampaignCount = campaigns.filter(
            (campaign) => campaign.status === "PENDING"
        ).length;

        const campaignStats = {
            openCount,
            closedCount,
            sentCount: sentCampaignCount,
            pendingCount: pendingCampaignCount,
        };

        res.json({ campaignStats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
