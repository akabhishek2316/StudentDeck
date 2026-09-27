const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],

        // Sorted, joined participant ids (e.g. "id1_id2"). Used to
        // enforce that only one conversation can exist between any
        // given pair of users. A unique index directly on the
        // `participants` array does NOT do this correctly — MongoDB
        // enforces uniqueness per array *element*, not per array, so
        // it would incorrectly block a user from having more than
        // one conversation at all.
        participantsKey: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

conversationSchema.pre("validate", function () {
    if (this.participants && this.participants.length > 0) {
        this.participantsKey = this.participants
            .map((id) => id.toString())
            .sort()
            .join("_");
    }
});

conversationSchema.index(
    { participantsKey: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);