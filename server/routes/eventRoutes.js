const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent
} = require("../controllers/eventController");

const router = express.Router();

// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);

// Protected routes
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;