const LostFound = require("../models/LostFound");
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

const createPost = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            category,
            location,
            date,
            image,
            imagePublicId,
            contactInfo
        } = req.body;

        if (
            !title ||
            !description ||
            !type ||
            !category ||
            !location ||
            !date ||
            !contactInfo
        ) {
            return res.status(400).json({
                message:
                    "All required fields must be provided"
            });
        }

        const post = await LostFound.create({
            user: req.user._id,
            title: title.trim(),
            description: description.trim(),
            type,
            category: category.trim(),
            location: location.trim(),
            date,
            image: image
                ? image.trim()
                : "",
            imagePublicId: imagePublicId
                ? imagePublicId.trim()
                : "",
            contactInfo: contactInfo.trim()
        });

        const populatedPost =
            await post.populate(
                "user",
                "name email profileImage department year"
            );

        return res.status(201).json({
            message:
                "Lost & Found post created successfully",
            post: populatedPost
        });
    } catch (error) {
        console.error(
            "Create Lost & Found post error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while creating Lost & Found post"
        });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await LostFound.find()
            .populate(
                "user",
                "name email profileImage department year"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            posts
        });
    } catch (error) {
        console.error(
            "Get Lost & Found posts error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching Lost & Found posts"
        });
    }
};

const getPostById = async (req, res) => {
    try {
        const post =
            await LostFound.findById(
                req.params.id
            ).populate(
                "user",
                "name email profileImage department year"
            );

        if (!post) {
            return res.status(404).json({
                message:
                    "Lost & Found post not found"
            });
        }

        return res.status(200).json({
            post
        });
    } catch (error) {
        console.error(
            "Get Lost & Found post error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching Lost & Found post"
        });
    }
};

const updatePost = async (req, res) => {
    try {
        const post =
            await LostFound.findById(
                req.params.id
            );

        if (!post) {
            return res.status(404).json({
                message:
                    "Lost & Found post not found"
            });
        }

        if (
            post.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only update your own posts"
            });
        }

        const {
            title,
            description,
            type,
            category,
            location,
            date,
            image,
            imagePublicId,
            contactInfo,
            status
        } = req.body;

        const oldImagePublicId =
            post.imagePublicId;

        if (title !== undefined) {
            post.title = title.trim();
        }

        if (description !== undefined) {
            post.description =
                description.trim();
        }

        if (type !== undefined) {
            post.type = type;
        }

        if (category !== undefined) {
            post.category =
                category.trim();
        }

        if (location !== undefined) {
            post.location =
                location.trim();
        }

        if (date !== undefined) {
            post.date = date;
        }

        if (image !== undefined) {
            post.image = image.trim();
        }

        if (imagePublicId !== undefined) {
            post.imagePublicId =
                imagePublicId.trim();
        }

        if (contactInfo !== undefined) {
            post.contactInfo =
                contactInfo.trim();
        }

        if (status !== undefined) {
            post.status = status;
        }

        const updatedPost =
            await post.save();

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

        const populatedPost =
            await updatedPost.populate(
                "user",
                "name email profileImage department year"
            );

        return res.status(200).json({
            message:
                "Lost & Found post updated successfully",
            post: populatedPost
        });
    } catch (error) {
        console.error(
            "Update Lost & Found post error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while updating Lost & Found post"
        });
    }
};

const deletePost = async (req, res) => {
    try {
        const post =
            await LostFound.findById(
                req.params.id
            );

        if (!post) {
            return res.status(404).json({
                message:
                    "Lost & Found post not found"
            });
        }

        if (
            post.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only delete your own posts"
            });
        }

        const imagePublicId =
            post.imagePublicId;

        await post.deleteOne();

        await deleteCloudinaryImage(
            imagePublicId
        );

        return res.status(200).json({
            message:
                "Lost & Found post deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete Lost & Found post error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while deleting Lost & Found post"
        });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
};