import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
    try {
        const { customerId, amount } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const newOrder = new Order({
            customerId,
            amount,
        });

        await newOrder.save();

        customer.totalSpending += amount;
        await customer.save();

        res.status(201).json({
            order: newOrder,
            updatedCustomer: {
                name: customer.name,
                email: customer.email,
                totalSpending: customer.totalSpending,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getOrdersByCustomerId = async (req, res) => {
    try {
        const { customerId } = req.params;

        const orders = await Order.find({ customerId }).populate(
            "customerId",
            "name email"
        );

        if (orders.length === 0) {
            return res
                .status(404)
                .json({ message: "No orders found for this customer" });
        }

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("customerId", "name email");

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate(
            "customerId",
            "name email"
        );
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updateData = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findByIdAndDelete(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
