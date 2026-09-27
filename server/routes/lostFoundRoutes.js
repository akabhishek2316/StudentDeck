const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
} = require("../controllers/lostFoundController");

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/:id", getPostById);

// Protected routes
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;