const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    generateUploadSignature
} = require("../controllers/uploadController");

const router = express.Router();

router.post(
    "/signature",
    protect,
    generateUploadSignature
);

module.exports = router;
