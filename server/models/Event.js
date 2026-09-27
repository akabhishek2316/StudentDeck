const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        createdBy: {
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

        organizer: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true,
            trim: true
        },

        endTime: {
            type: String,
            default: "",
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
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

        registrationLink: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Event",
    eventSchema
);