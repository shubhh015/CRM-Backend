import axios from "axios";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const router = express.Router();

router.post("/google", async (req, res) => {
    const { token } = req.body;

    try {
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
        );
        const googleUser = response.data;

        let user = await User.findOne({ googleId: googleUser.sub });
        if (!user) {
            user = new User({
                googleId: googleUser.sub,
                email: googleUser.email,
                name: googleUser.name,
            });
            await user.save();
        } else {
            user.name = googleUser.name;
            user.email = googleUser.email;
            await user.save();
        }

        const jwtToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Authentication successful!",
            token: jwtToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Error during Google authentication:", error);
        res.status(500).json({ message: "Error during authentication" });
    }
});

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Error logging out" });
        }
        res.redirect("/");
    });
});

export default router;
