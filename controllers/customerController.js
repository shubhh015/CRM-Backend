import Customer from "../models/Customer.js";

export const addCustomer = async (req, res) => {
    try {
        const { name, email, totalSpending, visits, lastVisit } = req.body;

        const newCustomer = new Customer({
            name,
            email,
            totalSpending,
            visits,
            lastVisit,
        });

        await newCustomer.save();

        res.status(201).json(newCustomer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const { customerId } = req.params;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const updateData = req.body;

        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            updateData,
            { new: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json(updatedCustomer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;

        const customer = await Customer.findByIdAndDelete(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
