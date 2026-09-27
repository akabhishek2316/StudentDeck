const mongoose = require("mongoose");

const academicResourceSchema = new mongoose.Schema(
    {
        uploadedBy: {
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
            default: "",
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        year: {
            type: Number,
            required: true,
            min: 1,
            max: 4
        },

        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },

        resourceType: {
            type: String,
            enum: [
                "question-paper",
                "notes",
                "study-material",
                "assignment",
                "other"
            ],
            required: true
        },

        fileUrl: {
            type: String,
            required: true,
            trim: true
        },

        filePublicId: {
            type: String,
            default: "",
            trim: true
        },

        fileResourceType: {
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
    "AcademicResource",
    academicResourceSchema
);