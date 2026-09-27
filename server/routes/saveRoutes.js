const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    saveItem,
    getSavedItems,
    checkSaved,
    removeSavedItem
} = require("../controllers/saveController");

const router = express.Router();

// All save routes require authentication
router.use(protect);

// Save an item
router.post("/", saveItem);

// Get current user's saved items
router.get("/", getSavedItems);

// Check whether current user saved an item
router.get("/check/:itemType/:itemId", checkSaved);

// Remove a saved item
router.delete("/:itemType/:itemId", removeSavedItem);

module.exports = router;