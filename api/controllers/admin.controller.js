import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

const makeStatusRegex = (value) =>
  new RegExp(`^${String(value || "").trim()}$`, "i");

const STATUS_FILTERS = {
  active: {
    $or: [
      { status: makeStatusRegex("active") },
      { status: { $exists: false }, isActive: { $ne: false } },
    ],
  },
  inactive: {
    $or: [
      { status: makeStatusRegex("inactive") },
      {
        status: { $exists: false },
        isActive: false,
      },
    ],
  },
  declined: {
    status: makeStatusRegex("declined"),
  },
  pending: {
    status: makeStatusRegex("pending"),
  },
};

const ACCEPTED_LIFETIME_FILTER = {
  $or: [{ wasAccepted: true }, ...STATUS_FILTERS.active.$or],
};

const parseBooleanParam = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  return null;
};

const normalizeStatusParam = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return ["active", "inactive", "pending", "declined"].includes(normalized)
    ? normalized
    : null;
};

const resolveStatusFilter = (statusParam, isActiveParam) => {
  const explicit = normalizeStatusParam(statusParam);
  if (explicit) return explicit;

  const fromBoolean = parseBooleanParam(isActiveParam);
  if (fromBoolean === true) return "active";
  if (fromBoolean === false) return "inactive";
  return null;
};

const buildQuery = (filters) => {
  if (!filters || filters.length === 0) return {};
  if (filters.length === 1) return filters[0];
  return { $and: filters };
};

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
    const statusParam = req.query.status; // active | inactive | pending | undefined
    const furnished = req.query.furnished; // true | false | undefined
    const parking = req.query.parking; // true | false | undefined

    const filters = [];
    if (search) {
      filters.push({ name: { $regex: search, $options: "i" } });
    }
    if (type && ["sale", "rent"].includes(type)) {
      filters.push({ type });
    }
    const offerValue = parseBooleanParam(offer);
    if (offerValue !== null) filters.push({ offer: offerValue });
    if (userId) filters.push({ userRef: userId });

    const furnishedValue = parseBooleanParam(furnished);
    if (furnishedValue !== null) filters.push({ furnished: furnishedValue });

    const parkingValue = parseBooleanParam(parking);
    if (parkingValue !== null) filters.push({ parking: parkingValue });

    const statusFilter = resolveStatusFilter(statusParam, isActive);
    if (statusFilter) {
      if (statusFilter === "pending" || statusFilter === "declined") {
        filters.push({ ...STATUS_FILTERS[statusFilter] });
      } else {
        filters.push({ $or: [...STATUS_FILTERS[statusFilter].$or] });
      }
    }

    const query = buildQuery(filters);

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
    const [total, active, inactive, declined, pending, offers, accepted] =
      await Promise.all([
        Listing.countDocuments({}),
        Listing.countDocuments(STATUS_FILTERS.active),
        Listing.countDocuments(STATUS_FILTERS.inactive),
        Listing.countDocuments(STATUS_FILTERS.declined),
        Listing.countDocuments(STATUS_FILTERS.pending),
        Listing.countDocuments({ offer: true }),
        Listing.countDocuments(ACCEPTED_LIFETIME_FILTER),
      ]);
    res.status(200).json({
      total,
      active,
      inactive,
      declined,
      pending,
      offers,
      accepted,
    });
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

// PATCH /api/admin/listings/:id/status  body: { status | isActive }
export const updateListingStatus = async (req, res, next) => {
  try {
    const rawStatus = req.body?.status;
    const rawIsActive = req.body?.isActive;

    let nextStatus =
      typeof rawStatus === "string" ? rawStatus.toLowerCase() : null;

    if (!nextStatus && typeof rawIsActive === "boolean") {
      nextStatus = rawIsActive ? "active" : "inactive";
    }

    if (!["active", "inactive", "pending", "declined"].includes(nextStatus)) {
      return next(errorHandler(400, "A valid status is required"));
    }

    const updates = {
      status: nextStatus,
      isActive: nextStatus === "active",
    };

    if (nextStatus === "active") {
      updates.wasAccepted = true;
    }

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
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
