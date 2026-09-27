const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");

        await dropLegacyConversationIndex();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

// One-time cleanup: an earlier version of the Conversation schema had
// a unique index directly on the `participants` array, which is a
// MongoDB anti-pattern (it enforces uniqueness per array *element*
// across the whole collection, not per array), and silently broke
// conversation creation for any user who already had one chat. The
// schema now uses a proper `participantsKey` index instead, but the
// old broken index has to be dropped from the database explicitly —
// changing the schema alone doesn't remove indexes that already exist.
const dropLegacyConversationIndex = async () => {
    try {
        const collection = mongoose.connection.db.collection(
            "conversations"
        );

        const indexes = await collection.indexes();

        const legacyIndex = indexes.find(
            (index) =>
                index.key &&
                Object.keys(index.key).length === 1 &&
                index.key.participants === 1
        );

        if (legacyIndex) {
            await collection.dropIndex(legacyIndex.name);

            console.log(
                `Dropped legacy index "${legacyIndex.name}" on conversations.participants`
            );
        }

        // Backfill participantsKey on any conversations created
        // before this field existed, so the new unique index can be
        // built without every old document colliding on a blank key.
        const staleConversations = await collection
            .find({
                participantsKey: { $exists: false }
            })
            .toArray();

        for (const conversation of staleConversations) {
            const participantsKey = (conversation.participants || [])
                .map((id) => id.toString())
                .sort()
                .join("_");

            await collection.updateOne(
                { _id: conversation._id },
                { $set: { participantsKey } }
            );
        }

        if (staleConversations.length > 0) {
            console.log(
                `Backfilled participantsKey on ${staleConversations.length} existing conversation(s)`
            );
        }
    } catch (error) {
        // Safe to ignore if the collection/index doesn't exist yet
        // (e.g. on a brand new database).
        if (error.codeName !== "NamespaceNotFound") {
            console.error(
                "Could not check/drop legacy conversation index:",
                error.message
            );
        }
    }
};

module.exports = connectDB;