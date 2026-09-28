const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

const createConversation = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                message:
                    "You cannot start a conversation with yourself"
            });
        }

        const otherUser = await User.findById(userId);

        if (!otherUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const participants = [
            req.user._id.toString(),
            userId.toString()
        ].sort();

        const participantsKey = participants.join("_");

        let conversation = await Conversation.findOne({
            participantsKey
        }).populate(
            "participants",
            "name email profileImage department year"
        );

        if (conversation) {
            return res.status(200).json({
                message: "Conversation already exists",
                conversation
            });
        }

        try {
            conversation = await Conversation.create({
                participants
            });
        } catch (createError) {
            // Duplicate key race: someone else created the same
            // conversation between the same two users a moment ago.
            // Fetch and return it instead of failing.
            if (createError.code === 11000) {
                conversation = await Conversation.findOne({
                    participantsKey
                });
            } else {
                throw createError;
            }
        }

        await conversation.populate(
            "participants",
            "name email profileImage department year"
        );

        return res.status(201).json({
            message: "Conversation created successfully",
            conversation
        });
    } catch (error) {
        console.error(
            "Create conversation error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while creating conversation"
        });
    }
};

const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
            .populate(
                "participants",
                "name email profileImage department year"
            )
            .sort({ updatedAt: -1 });

        const conversationIds = conversations.map(
            (conversation) => conversation._id
        );

        /*
         * Current user ke unread messages count karo.
         *
         * unread = read false
         * sender = current user nahi
         */
        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    conversation: {
                        $in: conversationIds
                    },
                    sender: {
                        $ne: req.user._id
                    },
                    read: false
                }
            },
            {
                $group: {
                    _id: "$conversation",
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

        const unreadMap = new Map(
            unreadCounts.map((item) => [
                item._id.toString(),
                item.count
            ])
        );

        /*
         * Har conversation ka latest message
         */
        const latestMessages = await Message.aggregate([
            {
                $match: {
                    conversation: {
                        $in: conversationIds
                    }
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $group: {
                    _id: "$conversation",
                    message: {
                        $first: "$$ROOT"
                    }
                }
            }
        ]);

        const latestMessageMap = new Map(
            latestMessages.map((item) => [
                item._id.toString(),
                item.message
            ])
        );

        const formattedConversations =
            conversations.map((conversation) => {
                const conversationId =
                    conversation._id.toString();

                const latestMessage =
                    latestMessageMap.get(
                        conversationId
                    );

                let lastMessage = "";

                if (latestMessage) {
                    if (
                        typeof latestMessage.text ===
                            "string" &&
                        latestMessage.text.trim()
                    ) {
                        lastMessage =
                            latestMessage.text.trim();
                    } else if (
                        latestMessage.attachment?.name
                    ) {
                        lastMessage =
                            latestMessage.attachment.name;
                    } else if (
                        latestMessage.attachment
                    ) {
                        lastMessage =
                            "Attachment";
                    }
                }

                return {
                    ...conversation.toObject(),

                    unreadCount:
                        unreadMap.get(
                            conversationId
                        ) || 0,

                    lastMessage
                };
            });

        return res.status(200).json({
            conversations:
                formattedConversations
        });

    } catch (error) {
        console.error(
            "Get conversations error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching conversations"
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            participants: req.user._id
        });

        if (!conversation) {
            return res.status(403).json({
                message:
                    "You are not a participant in this conversation"
            });
        }

        const messages = await Message.find({
            conversation: conversation._id
        })
            .populate(
                "sender",
                "name email profileImage department year"
            )
            .sort({ createdAt: 1 });

        return res.status(200).json({
            messages
        });
    } catch (error) {
        console.error(
            "Get messages error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching messages"
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { text, attachment } = req.body;

        const messageText =
            typeof text === "string"
                ? text.trim()
                : "";

        let messageAttachment = null;

        /*
         * Attachment sirf tab validate hoga
         * jab actual attachment diya gaya ho.
         */
        if (attachment != null) {

            if (
                typeof attachment !== "object" ||
                Array.isArray(attachment)
            ) {
                return res.status(400).json({
                    message: "Invalid attachment data"
                });
            }

            const {
                url,
                publicId,
                type,
                name
            } = attachment;

            if (
                !url ||
                typeof url !== "string" ||
                !url.trim()
            ) {
                return res.status(400).json({
                    message: "Attachment URL is required"
                });
            }

            if (
                type !== "image" &&
                type !== "file"
            ) {
                return res.status(400).json({
                    message:
                        "Attachment type must be image or file"
                });
            }

            messageAttachment = {
                url: url.trim(),

                publicId:
                    typeof publicId === "string"
                        ? publicId.trim()
                        : "",

                type,

                name:
                    typeof name === "string"
                        ? name.trim()
                        : ""
            };
        }

        /*
         * Text bhi nahi hai aur attachment bhi nahi
         */
        if (!messageText && !messageAttachment) {
            return res.status(400).json({
                message:
                    "Message text or attachment is required"
            });
        }

        /*
         * Conversation check
         */
        const conversation =
            await Conversation.findOne({
                _id: req.params.conversationId,
                participants: req.user._id
            });

        if (!conversation) {
            return res.status(403).json({
                message:
                    "You are not a participant in this conversation"
            });
        }

        /*
         * Message data
         */
        const messageData = {
            conversation: conversation._id,
            sender: req.user._id,
            text: messageText
        };

        if (messageAttachment) {
            messageData.attachment = messageAttachment;
        }

        /*
         * Save message
         */
        const message =
            await Message.create(messageData);

        /*
         * Update conversation
         */
        conversation.updatedAt = new Date();

        await conversation.save();

        /*
         * Populate sender
         */
        const populatedMessage =
            await message.populate(
                "sender",
                "name email profileImage department year"
            );

        /*
         * =========================
         * REALTIME SOCKET EVENT
         * =========================
         */

       const io = req.app.get("io");

if (io) {
    conversation.participants.forEach(
        (participantId) => {
            io.to(
                `user:${participantId}`
            ).emit(
                "new_message",
                populatedMessage
            );
        }
    );

   
}

        /*
         * Response
         */
        return res.status(201).json({
            message: "Message sent successfully",
            data: populatedMessage
        });

    } catch (error) {

        console.error(
            "Send message error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while sending message"
        });
    }
};

const markMessageAsRead = async (req, res) => {
    try {
        const message =
            await Message.findById(
                req.params.messageId
            );

        if (!message) {
            return res.status(404).json({
                message: "Message not found"
            });
        }

        const conversation =
            await Conversation.findOne({
                _id: message.conversation,
                participants: req.user._id
            });

        if (!conversation) {
            return res.status(403).json({
                message:
                    "You are not a participant in this conversation"
            });
        }

        /*
         * Already read hai to unnecessary socket event
         * mat bhejo.
         */
        if (!message.read) {
    message.delivered = true;
    message.read = true;

    await message.save();

            /*
             * Realtime read event
             */
            const io = req.app.get("io");

            if (io) {
    io.to(`user:${message.sender}`).emit(
        "message_read",
        {
            messageId: message._id,
            conversationId: conversation._id,
            readBy: req.user._id
        }
    );
}
        }

        return res.status(200).json({
            message:
                "Message marked as read",
            data: message
        });

    } catch (error) {
        console.error(
            "Mark message as read error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while updating message"
        });
    }
};

module.exports = {
    createConversation,
    getConversations,
    getMessages,
    sendMessage,
    markMessageAsRead
};