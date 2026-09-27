const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResource
} = require("../controllers/academicController");

const router = express.Router();

// Public routes
router.get("/", getResources);
router.get("/:id", getResourceById);

// Protected routes
router.post("/", protect, createResource);
router.put("/:id", protect, updateResource);
router.delete("/:id", protect, deleteResource);

module.exports = router;