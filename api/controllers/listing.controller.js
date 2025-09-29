import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    delete payload.status;
    delete payload.isActive;

    const listing = await Listing.create({
      ...payload,
      status: "pending",
      isActive: false,
    });
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, "Listing not found!"));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, "You can only delete your listings!"));
  }
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Listing has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, "Listing not found...."));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, "You can only delete your own listing..."));
  }
  try {
    const updates = { ...req.body };
    delete updates.status;
    delete updates.isActive;

    const updateListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.status(200).json(updateListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 9, 1);
    const pageParam = parseInt(req.query.page, 10);
    const startIndexParam = parseInt(req.query.startIndex, 10);

    const skip =
      !Number.isNaN(pageParam) && pageParam > 0
        ? (pageParam - 1) * limit
        : !Number.isNaN(startIndexParam) && startIndexParam >= 0
        ? startIndexParam
        : 0;

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "regularPrice",
      "discountPrice",
    ];

    const searchTerm = req.query.searchTerm || "";
    const sort = allowedSortFields.includes(req.query.sort)
      ? req.query.sort
      : "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const offerFilter =
      req.query.offer === undefined || req.query.offer === "false"
        ? { $in: [false, true] }
        : true;
    const furnishedFilter =
      req.query.furnished === undefined || req.query.furnished === "false"
        ? { $in: [false, true] }
        : true;
    const parkingFilter =
      req.query.parking === undefined || req.query.parking === "false"
        ? { $in: [false, true] }
        : true;
    const typeFilter =
      req.query.type === undefined || req.query.type === "all"
        ? { $in: ["sale", "rent"] }
        : req.query.type;

    const filters = {
      name: { $regex: searchTerm, $options: "i" },
      offer: offerFilter,
      furnished: furnishedFilter,
      parking: parkingFilter,
      type: typeFilter,
      status: { $in: ["active", null] },
      isActive: { $ne: false },
    };

    const totalCount = await Listing.countDocuments(filters);

    const listings = await Listing.find(filters)
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit);

    const currentPage =
      !Number.isNaN(pageParam) && pageParam > 0
        ? pageParam
        : Math.floor(skip / limit) + 1;
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    return res
      .status(200)
      .json({ listings, totalCount, page: currentPage, totalPages, limit });
  } catch (error) {
    next(error);
  }
};

export const getListingStats = async (req, res, next) => {
  try {
    const baseFilter = {
      status: { $in: ["active", null] },
      isActive: { $ne: false },
    };

    const [totalActive, saleCount, rentCount, offerCount] = await Promise.all([
      Listing.countDocuments(baseFilter),
      Listing.countDocuments({ ...baseFilter, type: "sale" }),
      Listing.countDocuments({ ...baseFilter, type: "rent" }),
      Listing.countDocuments({ ...baseFilter, offer: true }),
    ]);

    res.status(200).json({
      totalActive,
      saleCount,
      rentCount,
      offerCount,
    });
  } catch (error) {
    next(error);
  }
};
