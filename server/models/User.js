const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        profileImage: {
            type: String,
            default: ""
        },
        profileImagePublicId: {
    type: String,
    default: ""
},

        department: {
            type: String,
            required: true,
            trim: true
        },

        year: {
            type: Number,
            required: true
        },

        phone: {
            type: String,
            default: ""
        },

        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;