const mongoose = require("mongoose");

const marketplaceSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        isFree: {
            type: Boolean,
            default: false
        },

        category: {
            type: String,
            enum: [
                "furniture",
                "electronics",
                "books",
                "cycles",
                "other"
            ],
            required: true
        },

        condition: {
            type: String,
            enum: [
                "new",
                "good",
                "used"
            ],
            required: true
        },

        image: {
            type: String,
            default: "",
            trim: true
        },

        imagePublicId: {
            type: String,
            default: "",
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Marketplace",
    marketplaceSchema
);