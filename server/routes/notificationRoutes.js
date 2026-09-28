const express = require("express");

const protect = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

const router = express.Router();

/*
 * GET CURRENT USER NOTIFICATIONS
 */
router.get("/", protect, async (req, res) => {
    try {
        const notifications =
            await Notification.find({
                recipient: req.user._id
            })
                .populate(
                    "actor",
                    "name profileImage"
                )
                .sort({
                    createdAt: -1
                })
                .limit(50);

        const unreadCount =
            await Notification.countDocuments({
                recipient: req.user._id,
                read: false
            });

        return res.status(200).json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error(
            "Get notifications error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching notifications"
        });
    }
});

/*
 * MARK ONE NOTIFICATION AS READ
 */
router.put(
    "/:id/read",
    protect,
    async (req, res) => {
        try {
            const notification =
                await Notification.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        recipient: req.user._id
                    },
                    {
                        read: true
                    },
                    {
                        new: true
                    }
                );

            if (!notification) {
                return res.status(404).json({
                    message:
                        "Notification not found"
                });
            }

            return res.status(200).json({
                notification
            });
        } catch (error) {
            console.error(
                "Mark notification read error:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Server error while updating notification"
            });
        }
    }
);

/*
 * MARK ALL NOTIFICATIONS AS READ
 */
router.put(
    "/read-all",
    protect,
    async (req, res) => {
        try {
            await Notification.updateMany(
                {
                    recipient: req.user._id,
                    read: false
                },
                {
                    read: true
                }
            );

            return res.status(200).json({
                message:
                    "All notifications marked as read"
            });
        } catch (error) {
            console.error(
                "Mark all notifications read error:",
                error.message
            );

            return res.status(500).json({
                message:
                    "Server error while updating notifications"
            });
        }
    }
);

module.exports = router;