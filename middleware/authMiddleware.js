import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Access Denied. No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res
            .status(401)
            .json({ message: "Access Denied. No token provided" });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key",
        (err, user) => {
            if (err) {
                return res
                    .status(403)
                    .json({ message: "Invalid or expired token" });
            }

            req.user = user;
            next();
        }
    );
};
