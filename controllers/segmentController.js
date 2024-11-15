import Customer from "../models/Customer.js";
import Segment from "../models/Segment.js";

export const createSegment = async (req, res) => {
    try {
        const { name, conditions, logic } = req.body;
        const userId = req.body.userId;

        if (!name || !conditions || !Array.isArray(conditions)) {
            return res.status(400).json({
                message: "Invalid input. Name and conditions are required.",
            });
        }

        let query = {};
        conditions.forEach((condition) => {
            const { field, operator, value } = condition;
            switch (operator) {
                case ">":
                    query[field] = { $gt: value };
                    break;
                case "<":
                    query[field] = { $lt: value };
                    break;
                case "=":
                    query[field] = value;
                    break;
                default:
                    break;
            }
        });

        let filterQuery;
        if (logic === "OR") {
            filterQuery = { $or: [query] };
        } else {
            filterQuery = query;
        }
        const segmentsData = conditions.map((group) => ({
            logic: group.logic,
            conditions: group.conditions,
        }));

        const customers = await Customer.find(filterQuery);
        const audienceSize = customers.length;

        const newSegment = new Segment({
            userId,
            name,
            conditions: segmentsData,
            audienceSize,
        });

        await newSegment.save();

        res.status(201).json({ segment: newSegment, audienceSize });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getSegments = async (req, res) => {
    try {
        const { userId } = req.query;

        const segments = await Segment.find({ userId: userId });

        if (!segments) {
            return res
                .status(204)
                .json({ message: "No segments found for this user" });
        }

        res.json(
            segments.map((segment) => ({
                ...segment.toObject(),
                audienceSize: segment.audienceSize,
            }))
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getSegmentById = async (req, res) => {
    try {
        const { segmentId } = req.params;

        const segment = await Segment.findById(segmentId);
        if (!segment) {
            return res.status(404).json({ message: "Segment not found" });
        }

        res.json(segment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const updateSegment = async (req, res) => {
    try {
        const { segmentId } = req.params;
        const updateData = req.body;

        const updatedSegment = await Segment.findByIdAndUpdate(
            segmentId,
            updateData,
            { new: true }
        );

        if (!updatedSegment) {
            return res.status(404).json({ message: "Segment not found" });
        }

        res.json(updatedSegment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteSegment = async (req, res) => {
    try {
        const { segmentId } = req.params;

        const segment = await Segment.findByIdAndDelete(segmentId);
        if (!segment) {
            return res.status(404).json({ message: "Segment not found" });
        }

        res.json({ message: "Segment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
