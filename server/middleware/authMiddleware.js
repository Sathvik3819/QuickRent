import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const Authentication = (req, res, next) => {
    const token = req.cookies.token;

    try {
        // Verify token
        // Assuming JWT_SECRET is defined in your .env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }


    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const OptionalAuthentication = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        // No token = Guest user
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // Token invalid = Treat as Guest
        req.user = null;
        next();
    }
};
