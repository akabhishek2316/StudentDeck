const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing
} = require("../controllers/marketplaceController");

const router = express.Router();

// Public: anyone can view marketplace listings
router.get("/", getListings);

// Public: anyone can view a specific listing
router.get("/:id", getListingById);

// Protected: logged-in users can create listings
router.post("/", protect, createListing);

// Protected: only the owner can update/delete
router.put("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);

module.exports = router;