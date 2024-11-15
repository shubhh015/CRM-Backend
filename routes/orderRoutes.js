import express from "express";
import {
    createOrder,
    deleteOrder,
    getAllOrders,
    getOrderById,
    getOrdersByCustomerId,
    updateOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);

router.get("/customer/:customerId", getOrdersByCustomerId);

router.get("/", getAllOrders);

router.get("/:orderId", getOrderById);

router.put("/:orderId", updateOrder);

router.delete("/:orderId", deleteOrder);

export default router;
