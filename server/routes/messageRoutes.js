const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createConversation,
    getConversations,
    getMessages,
    sendMessage,
    markMessageAsRead
} = require("../controllers/messageController");

const router = express.Router();

// All messaging routes require authentication
router.use(protect);

// Conversations
router.post("/conversations", createConversation);
router.get("/conversations", getConversations);

// Messages inside a conversation
router.get(
    "/conversations/:conversationId",
    getMessages
);

router.post(
    "/conversations/:conversationId",
    sendMessage
);

// Mark a message as read
router.put(
    "/:messageId/read",
    markMessageAsRead
);

module.exports = router;