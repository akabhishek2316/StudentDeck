const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
    {
        user: {
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

        type: {
            type: String,
            enum: ["lost", "found"],
            required: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
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

        contactInfo: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["active", "resolved"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "LostFound",
    lostFoundSchema
);
