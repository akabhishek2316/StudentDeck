const Event = require("../models/Event");
const cloudinary = require("../config/cloudinary");

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) {
        return;
    }

    try {
        await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: "image"
            }
        );
    } catch (error) {
        console.error(
            "Cloudinary image deletion error:",
            error.message
        );
    }
};

const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            organizer,
            date,
            startTime,
            endTime,
            location,
            category,
            image,
            imagePublicId,
            registrationLink
        } = req.body;

        if (
            !title ||
            !description ||
            !organizer ||
            !date ||
            !startTime ||
            !location ||
            !category
        ) {
            return res.status(400).json({
                message:
                    "All required event fields must be provided"
            });
        }

        const event = await Event.create({
            createdBy: req.user._id,
            title: title.trim(),
            description: description.trim(),
            organizer: organizer.trim(),
            date,
            startTime: startTime.trim(),
            endTime: endTime
                ? endTime.trim()
                : "",
            location: location.trim(),
            category: category.trim(),
            image: image
                ? image.trim()
                : "",
            imagePublicId: imagePublicId
                ? imagePublicId.trim()
                : "",
            registrationLink:
                registrationLink
                    ? registrationLink.trim()
                    : ""
        });

        const populatedEvent =
            await event.populate(
                "createdBy",
                "name email profileImage department year"
            );

        return res.status(201).json({
            message:
                "Event created successfully",
            event: populatedEvent
        });
    } catch (error) {
        console.error(
            "Create event error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while creating event"
        });
    }
};

const getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate(
                "createdBy",
                "name email profileImage department year"
            )
            .sort({
                date: 1,
                startTime: 1
            });

        return res.status(200).json({
            events
        });
    } catch (error) {
        console.error(
            "Get events error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching events"
        });
    }
};

const getEventById = async (req, res) => {
    try {
        const event =
            await Event.findById(
                req.params.id
            ).populate(
                "createdBy",
                "name email profileImage department year"
            );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        return res.status(200).json({
            event
        });
    } catch (error) {
        console.error(
            "Get event error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching event"
        });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event =
            await Event.findById(
                req.params.id
            );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (
            event.createdBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only update your own events"
            });
        }

        const {
            title,
            description,
            organizer,
            date,
            startTime,
            endTime,
            location,
            category,
            image,
            imagePublicId,
            registrationLink
        } = req.body;

        const oldImagePublicId =
            event.imagePublicId;

        if (title !== undefined) {
            event.title = title.trim();
        }

        if (description !== undefined) {
            event.description =
                description.trim();
        }

        if (organizer !== undefined) {
            event.organizer =
                organizer.trim();
        }

        if (date !== undefined) {
            event.date = date;
        }

        if (startTime !== undefined) {
            event.startTime =
                startTime.trim();
        }

        if (endTime !== undefined) {
            event.endTime =
                endTime.trim();
        }

        if (location !== undefined) {
            event.location =
                location.trim();
        }

        if (category !== undefined) {
            event.category =
                category.trim();
        }

        if (image !== undefined) {
            event.image =
                image.trim();
        }

        if (imagePublicId !== undefined) {
            event.imagePublicId =
                imagePublicId.trim();
        }

        if (
            registrationLink !== undefined
        ) {
            event.registrationLink =
                registrationLink.trim();
        }

        const updatedEvent =
            await event.save();

        if (
            imagePublicId !== undefined &&
            imagePublicId.trim() &&
            oldImagePublicId &&
            oldImagePublicId !==
                imagePublicId.trim()
        ) {
            await deleteCloudinaryImage(
                oldImagePublicId
            );
        }

        const populatedEvent =
            await updatedEvent.populate(
                "createdBy",
                "name email profileImage department year"
            );

        return res.status(200).json({
            message:
                "Event updated successfully",
            event: populatedEvent
        });
    } catch (error) {
        console.error(
            "Update event error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while updating event"
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event =
            await Event.findById(
                req.params.id
            );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (
            event.createdBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only delete your own events"
            });
        }

        const imagePublicId =
            event.imagePublicId;

        await event.deleteOne();

        await deleteCloudinaryImage(
            imagePublicId
        );

        return res.status(200).json({
            message:
                "Event deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete event error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while deleting event"
        });
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent
};