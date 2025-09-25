import express from "express";
import {
  getAdminUsers,
  getAdminListings,
  getBasicMetrics,
  updateUserStatus,
  updateListingActive,
  adminDeleteListing,
} from "../controllers/admin.controller.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";

const router = express.Router();

router.get("/users", verifyAdmin, getAdminUsers);
router.get("/listings", verifyAdmin, getAdminListings);
router.get("/metrics", verifyAdmin, getBasicMetrics);
router.patch("/users/:id/status", verifyAdmin, updateUserStatus);
router.patch("/listings/:id/active", verifyAdmin, updateListingActive);
router.delete("/listings/:id", verifyAdmin, adminDeleteListing);

export default router;
