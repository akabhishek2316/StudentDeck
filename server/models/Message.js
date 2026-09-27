const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        text: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        attachment: {
            type: {
                type: String,
                enum: ["image", "file"],
                default: undefined
            },

            url: {
                type: String,
                default: undefined
            },

            publicId: {
                type: String,
                default: undefined
            },

            name: {
                type: String,
                default: undefined
            }
        },

        delivered: {
  type: Boolean,
  default: false
},

        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Message", messageSchema);