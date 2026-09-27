const Marketplace = require("../models/Marketplace");
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

const createListing = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            isFree,
            category,
            condition,
            image,
            imagePublicId,
            location
        } = req.body;

        if (
            !title ||
            !description ||
            price === undefined ||
            isFree === undefined ||
            !category ||
            !condition ||
            !location
        ) {
            return res.status(400).json({
                message:
                    "All required listing fields must be provided"
            });
        }

        const numericPrice = Number(price);

        if (
            Number.isNaN(numericPrice) ||
            numericPrice < 0
        ) {
            return res.status(400).json({
                message:
                    "Price must be a valid non-negative number"
            });
        }

        if (
            isFree === true &&
            numericPrice !== 0
        ) {
            return res.status(400).json({
                message:
                    "Free listings must have a price of 0"
            });
        }

        const listing = await Marketplace.create({
            seller: req.user._id,
            title: title.trim(),
            description: description.trim(),
            price: numericPrice,
            isFree,
            category,
            condition,
            image: image
                ? image.trim()
                : "",
            imagePublicId: imagePublicId
                ? imagePublicId.trim()
                : "",
            location: location.trim()
        });

        const populatedListing =
            await listing.populate(
                "seller",
                "name email profileImage department year"
            );

        return res.status(201).json({
            message:
                "Listing created successfully",
            listing: populatedListing
        });
    } catch (error) {
        console.error(
            "Create listing error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while creating listing"
        });
    }
};

const getListings = async (req, res) => {
    try {
        const listings = await Marketplace.find()
            .populate(
                "seller",
                "name email profileImage department year"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            listings
        });
    } catch (error) {
        console.error(
            "Get listings error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching listings"
        });
    }
};

const getListingById = async (req, res) => {
    try {
        const listing =
            await Marketplace.findById(
                req.params.id
            ).populate(
                "seller",
                "name email profileImage department year"
            );

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found"
            });
        }

        return res.status(200).json({
            listing
        });
    } catch (error) {
        console.error(
            "Get listing error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching listing"
        });
    }
};

const updateListing = async (req, res) => {
    try {
        const listing =
            await Marketplace.findById(
                req.params.id
            );

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found"
            });
        }

        if (
            listing.seller.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only update your own listings"
            });
        }

        const {
            title,
            description,
            price,
            isFree,
            category,
            condition,
            image,
            imagePublicId,
            location
        } = req.body;

        const oldImagePublicId =
            listing.imagePublicId;

        if (title !== undefined) {
            listing.title = title.trim();
        }

        if (description !== undefined) {
            listing.description =
                description.trim();
        }

        if (price !== undefined) {
            const numericPrice = Number(price);

            if (
                Number.isNaN(numericPrice) ||
                numericPrice < 0
            ) {
                return res.status(400).json({
                    message:
                        "Price must be a valid non-negative number"
                });
            }

            listing.price = numericPrice;
        }

        if (isFree !== undefined) {
            listing.isFree = isFree;
        }

        if (
            listing.isFree &&
            listing.price !== 0
        ) {
            return res.status(400).json({
                message:
                    "Free listings must have a price of 0"
            });
        }

        if (category !== undefined) {
            listing.category = category;
        }

        if (condition !== undefined) {
            listing.condition = condition;
        }

        if (image !== undefined) {
            listing.image = image.trim();
        }

        if (imagePublicId !== undefined) {
            listing.imagePublicId =
                imagePublicId.trim();
        }

        if (location !== undefined) {
            listing.location = location.trim();
        }

        const updatedListing =
            await listing.save();

        /*
         * If a new Cloudinary image replaced
         * the old one, delete the old asset.
         */
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

        const populatedListing =
            await updatedListing.populate(
                "seller",
                "name email profileImage department year"
            );

        return res.status(200).json({
            message:
                "Listing updated successfully",
            listing: populatedListing
        });
    } catch (error) {
        console.error(
            "Update listing error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while updating listing"
        });
    }
};

const deleteListing = async (req, res) => {
    try {
        const listing =
            await Marketplace.findById(
                req.params.id
            );

        if (!listing) {
            return res.status(404).json({
                message: "Listing not found"
            });
        }

        if (
            listing.seller.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only delete your own listings"
            });
        }

        const imagePublicId =
            listing.imagePublicId;

        await listing.deleteOne();

        /*
         * Remove the associated image from
         * Cloudinary after deleting the listing.
         */
        await deleteCloudinaryImage(
            imagePublicId
        );

        return res.status(200).json({
            message:
                "Listing deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete listing error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while deleting listing"
        });
    }
};

module.exports = {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing
};