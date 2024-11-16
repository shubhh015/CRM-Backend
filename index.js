import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import connectDB from "./config/db.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import authRoutes from "./routes/authRoutes.js";
import routes from "./routes/index.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

const corsOptions = {
    origin: "http://localhost:3000/",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(cors(corsOptions));

app.use("/auth", authRoutes);
app.use("/api", routes);

connectDB();

connectRabbitMQ();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
