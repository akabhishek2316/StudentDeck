const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createResource,
    getResources,
    getResourceById,
    getResourceFile,
    updateResource,
    deleteResource
} = require("../controllers/academicController");

const router = express.Router();

/*
 * PUBLIC
 * Resource list/details visible without login.
 * Actual PDF/file URL is NOT exposed.
 */
router.get("/", getResources);

router.get("/:id", getResourceById);

/*
 * PROTECTED
 * Actual PDF/file access requires login.
 */
router.get(
    "/:id/file",
    protect,
    getResourceFile
);

/*
 * PROTECTED
 * Create / update / delete require login.
 */
router.post(
    "/",
    protect,
    createResource
);

router.put(
    "/:id",
    protect,
    updateResource
);

router.delete(
    "/:id",
    protect,
    deleteResource
);

module.exports = router;