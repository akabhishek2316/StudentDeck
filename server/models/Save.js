const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        itemType: {
            type: String,
            enum: [
                "marketplace",
                "academic",
                "event",
                "lost-found"
            ],
            required: true
        },

        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    {
        timestamps: true
    }
);

saveSchema.index(
    {
        user: 1,
        itemType: 1,
        itemId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Save", saveSchema);