import express from "express";
import {
    createSegment,
    deleteSegment,
    getSegmentById,
    getSegments,
    updateSegment,
} from "../controllers/segmentController.js";

const router = express.Router();

router.post("/", createSegment);
router.get("/", getSegments);
router.get("/:segmentId", getSegmentById);
router.put("/:segmentId", updateSegment);
router.delete("/:segmentId", deleteSegment);

export default router;
