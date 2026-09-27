const cloudinary = require("../config/cloudinary");

const generateUploadSignature = async (req, res) => {
    try {
        const timestamp = Math.round(
            new Date().getTime() / 1000
        );

        const folder =
            req.body.folder ||
            "StudentDeck";

        const signature =
            cloudinary.utils.api_sign_request(
                {
                    timestamp,
                    folder
                },
                process.env.CLOUDINARY_API_SECRET
            );

        return res.status(200).json({
            timestamp,
            signature,
            cloudName:
                process.env.CLOUDINARY_CLOUD_NAME,
            apiKey:
                process.env.CLOUDINARY_API_KEY,
            folder
        });
    } catch (error) {
        console.error(
            "Generate Cloudinary signature error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while generating upload signature"
        });
    }
};

module.exports = {
    generateUploadSignature
};