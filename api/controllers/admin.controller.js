import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

// GET /api/admin/users?search=&page=1&limit=10&sort=createdAt&order=desc
export const getAdminUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const sort = req.query.sort || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const query = {};
    if (req.query.status === "approved") {
      query.status = { $ne: "deactivated" };
    } else if (req.query.status === "deactivated") {
      query.status = "deactivated";
    }
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      items,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/summary
export const getUserSummary = async (req, res, next) => {
  try {
    const [total, inactive] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: "deactivated" }),
    ]);
    const active = Math.max(total - inactive, 0);
    res.status(200).json({ total, active, inactive });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/listings?search=&page=1&limit=10&sort=createdAt&order=desc&type=&offer=&userId=
export const getAdminListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const sort = req.query.sort || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;
    const type = req.query.type; // sale | rent | undefined
    const offer = req.query.offer; // true | false | undefined
    const userId = req.query.userId; // filter by owner
    const isActive = req.query.isActive; // true | false | undefined
    const status = req.query.status; // active | inactive | undefined
    const furnished = req.query.furnished; // true | false | undefined
    const parking = req.query.parking; // true | false | undefined

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (type && ["sale", "rent"].includes(type)) {
      query.type = type;
    }
    if (["true", "yes"].includes(offer)) query.offer = true;
    if (["false", "no"].includes(offer)) query.offer = false;
    if (userId) query.userRef = userId;
    const normalizeTruthy = (value) =>
      typeof value === "string"
        ? ["true", "1", "yes"].includes(value.toLowerCase())
        : value === true;
    const normalizeFalsy = (value) =>
      typeof value === "string"
        ? ["false", "0", "no"].includes(value.toLowerCase())
        : value === false;

    if (normalizeTruthy(isActive) || status === "active") {
      query.isActive = { $ne: false };
    } else if (normalizeFalsy(isActive) || status === "inactive") {
      query.isActive = false;
    }
    if (["true", "yes"].includes(furnished)) query.furnished = true;
    if (["false", "no"].includes(furnished)) query.furnished = false;
    if (["true", "yes"].includes(parking)) query.parking = true;
    if (["false", "no"].includes(parking)) query.parking = false;

    const [items, total] = await Promise.all([
      Listing.find(query)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(query),
    ]);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      items,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/listings/summary
export const getListingSummary = async (req, res, next) => {
  try {
    const [total, inactive, offers, active] = await Promise.all([
      Listing.countDocuments({}),
      Listing.countDocuments({ isActive: false }),
      Listing.countDocuments({ offer: true }),
      Listing.countDocuments({ isActive: { $ne: false } }),
    ]);
    res.status(200).json({ total, active, inactive, offers });
  } catch (err) {
    next(err);
  }
};

// Simple metrics for dashboard: total users, total listings, listingsToday
export const getBasicMetrics = async (req, res, next) => {
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const [users, listings, listingsToday] = await Promise.all([
      User.countDocuments({}),
      Listing.countDocuments({}),
      Listing.countDocuments({ createdAt: { $gte: since } }),
    ]);
    res.status(200).json({ users, listings, listingsToday });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/status  body: { status }
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "deactivated"].includes(status)) {
      return next(errorHandler(400, "Invalid status"));
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, select: "-password" }
    ).select("-password");
    if (!user) return next(errorHandler(404, "User not found"));
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/listings/:id/active  body: { isActive }
export const updateListingActive = async (req, res, next) => {
  try {
    if (typeof req.body.isActive !== "boolean") {
      return next(errorHandler(400, "isActive boolean required"));
    }
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: req.body.isActive } },
      { new: true }
    );
    if (!listing) return next(errorHandler(404, "Listing not found"));
    res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/listings/:id (admin forced delete)
export const adminDeleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found"));
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
