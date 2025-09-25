import { verifyToken } from "./verifyUser.js";
import User from "../models/user.model.js";
import { errorHandler } from "./error.js";

// Combines auth + role check. Use this after routes that require admin privileges.
export const verifyAdmin = async (req, res, next) => {
  // First verify JWT using existing middleware style but adapted for async/await chain
  try {
    // Reuse verifyToken logic by wrapping it in a promise
    await new Promise((resolve, reject) => {
      verifyToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const user = await User.findById(req.user.id).select("isAdmin");
    if (!user) return next(errorHandler(404, "User not found"));
    if (!user.isAdmin) return next(errorHandler(403, "Admin access required"));
    next();
  } catch (err) {
    next(err);
  }
};

export default verifyAdmin;
