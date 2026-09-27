const Save = require("../models/Save");
const Marketplace = require("../models/Marketplace");
const AcademicResource = require("../models/AcademicResource");
const Event = require("../models/Event");
const LostFound = require("../models/LostFound");

const saveItem = async (req, res) => {
    try {
        const { itemType, itemId } = req.body;

        if (!itemType || !itemId) {
            return res.status(400).json({
                message: "itemType and itemId are required"
            });
        }

        const existingSave = await Save.findOne({
            user: req.user._id,
            itemType,
            itemId
        });

        if (existingSave) {
            return res.status(409).json({
                message: "Item is already saved"
            });
        }

        const save = await Save.create({
            user: req.user._id,
            itemType,
            itemId
        });

        return res.status(201).json({
            message: "Item saved successfully",
            save
        });
    } catch (error) {
        console.error("Save item error:", error.message);

        return res.status(500).json({
            message: "Server error while saving item"
        });
    }
};

const getSavedItems = async (req, res) => {
    try {
        const saves = await Save.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        const savedItems = await Promise.all(
            saves.map(async (save) => {
                let item = null;

                if (save.itemType === "marketplace") {
                    item = await Marketplace.findById(
                        save.itemId
                    ).populate(
                        "seller",
                        "name email profileImage"
                    );
                }

                if (save.itemType === "academic") {
                    item = await AcademicResource.findById(
                        save.itemId
                    ).populate(
                        "uploadedBy",
                        "name email profileImage"
                    );
                }

                if (save.itemType === "event") {
                    item = await Event.findById(
                        save.itemId
                    ).populate(
                        "createdBy",
                        "name email profileImage"
                    );
                }

                if (save.itemType === "lost-found") {
                    item = await LostFound.findById(
                        save.itemId
                    ).populate(
                        "user",
                        "name email profileImage"
                    );
                }

                return {
                    _id: save._id,
                    itemType: save.itemType,
                    itemId: save.itemId,
                    createdAt: save.createdAt,
                    item
                };
            })
        );

        return res.status(200).json({
            saves: savedItems
        });
    } catch (error) {
        console.error(
            "Get saved items error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching saved items"
        });
    }
};

const checkSaved = async (req, res) => {
    try {
        const { itemType, itemId } = req.params;

        const save = await Save.findOne({
            user: req.user._id,
            itemType,
            itemId
        });

        return res.status(200).json({
            saved: !!save
        });
    } catch (error) {
        console.error(
            "Check saved item error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while checking saved item"
        });
    }
};

const removeSavedItem = async (req, res) => {
    try {
        const { itemType, itemId } = req.params;

        const save = await Save.findOneAndDelete({
            user: req.user._id,
            itemType,
            itemId
        });

        if (!save) {
            return res.status(404).json({
                message: "Saved item not found"
            });
        }

        return res.status(200).json({
            message:
                "Item removed from saved items"
        });
    } catch (error) {
        console.error(
            "Remove saved item error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while removing saved item"
        });
    }
};

module.exports = {
    saveItem,
    getSavedItems,
    checkSaved,
    removeSavedItem
};