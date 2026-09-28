const User = require("../models/User");
const Notification = require("../models/Notification");

const createNotificationForAllUsers = async ({
    io,
    actorId,
    type,
    title,
    message,
    link = ""
}) => {
    try {
        const users = await User.find(
            {
                _id: {
                    $ne: actorId
                }
            },
            "_id"
        ).lean();

        if (!users.length) {
            return;
        }

        const notifications = users.map(
            (user) => ({
                recipient: user._id,
                actor: actorId,
                type,
                title,
                message,
                link,
                read: false
            })
        );

        const createdNotifications =
            await Notification.insertMany(
                notifications
            );

        if (!io) {
            return;
        }

        createdNotifications.forEach(
            (notification) => {
                io.to(
                    `user:${String(
                        notification.recipient
                    )}`
                ).emit(
                    "new_notification",
                    {
                        _id: notification._id,
                        recipient:
                            notification.recipient,
                        actor: actorId,
                        type:
                            notification.type,
                        title:
                            notification.title,
                        message:
                            notification.message,
                        link:
                            notification.link,
                        read: false,
                        createdAt:
                            notification.createdAt
                    }
                );
            }
        );
    } catch (error) {
        /*
         * Notification fail hone ki wajah se
         * actual post creation fail nahi hona chahiye.
         */
        console.error(
            "Notification creation error:",
            error.message
        );
    }
};

module.exports = {
    createNotificationForAllUsers
};