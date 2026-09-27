const AcademicResource = require("../models/AcademicResource");
const cloudinary = require("../config/cloudinary");

const deleteCloudinaryFile = async (
    publicId,
    resourceType
) => {
    if (!publicId) {
        return;
    }

    try {
        await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type:
                    resourceType || "raw",
                invalidate: true
            }
        );
    } catch (error) {
        console.error(
            "Cloudinary academic resource cleanup error:",
            error.message
        );
    }
};

const createResource = async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            department,
            year,
            semester,
            resourceType,
            fileUrl,
            filePublicId,
            fileResourceType
        } = req.body;

        if (
            !title ||
            !subject ||
            !department ||
            year === undefined ||
            semester === undefined ||
            !resourceType ||
            !fileUrl
        ) {
            return res.status(400).json({
                message:
                    "All required resource fields must be provided"
            });
        }

        const numericYear = Number(year);
        const numericSemester = Number(semester);

        if (
            !Number.isInteger(numericYear) ||
            numericYear < 1 ||
            numericYear > 4
        ) {
            return res.status(400).json({
                message: "Year must be between 1 and 4"
            });
        }

        if (
            !Number.isInteger(numericSemester) ||
            numericSemester < 1 ||
            numericSemester > 8
        ) {
            return res.status(400).json({
                message:
                    "Semester must be between 1 and 8"
            });
        }

        const resource =
            await AcademicResource.create({
                uploadedBy: req.user._id,
                title: title.trim(),
                description: description
                    ? description.trim()
                    : "",
                subject: subject.trim(),
                department: department.trim(),
                year: numericYear,
                semester: numericSemester,
                resourceType,
                fileUrl: fileUrl.trim(),
                filePublicId: filePublicId
                    ? filePublicId.trim()
                    : "",
                fileResourceType:
                    fileResourceType
                        ? fileResourceType.trim()
                        : ""
            });

        const populatedResource =
            await resource.populate(
                "uploadedBy",
                "name email profileImage department year"
            );

        return res.status(201).json({
            message:
                "Academic resource created successfully",
            resource: populatedResource
        });
    } catch (error) {
        console.error(
            "Create academic resource error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while creating academic resource"
        });
    }
};

const getResources = async (req, res) => {
    try {
        const resources =
            await AcademicResource.find()
                .populate(
                    "uploadedBy",
                    "name email profileImage department year"
                )
                .sort({ createdAt: -1 });

        return res.status(200).json({
            resources
        });
    } catch (error) {
        console.error(
            "Get academic resources error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching academic resources"
        });
    }
};

const getResourceById = async (req, res) => {
    try {
        const resource =
            await AcademicResource.findById(
                req.params.id
            ).populate(
                "uploadedBy",
                "name email profileImage department year"
            );

        if (!resource) {
            return res.status(404).json({
                message:
                    "Academic resource not found"
            });
        }

        return res.status(200).json({
            resource
        });
    } catch (error) {
        console.error(
            "Get academic resource error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching academic resource"
        });
    }
};

const updateResource = async (req, res) => {
    try {
        const resource =
            await AcademicResource.findById(
                req.params.id
            );

        if (!resource) {
            return res.status(404).json({
                message:
                    "Academic resource not found"
            });
        }

        if (
            resource.uploadedBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only update your own resources"
            });
        }

        const {
            title,
            description,
            subject,
            department,
            year,
            semester,
            resourceType,
            fileUrl,
            filePublicId,
            fileResourceType
        } = req.body;

        if (title !== undefined) {
            resource.title = title.trim();
        }

        if (description !== undefined) {
            resource.description =
                description.trim();
        }

        if (subject !== undefined) {
            resource.subject = subject.trim();
        }

        if (department !== undefined) {
            resource.department =
                department.trim();
        }

        if (year !== undefined) {
            const numericYear = Number(year);

            if (
                !Number.isInteger(numericYear) ||
                numericYear < 1 ||
                numericYear > 4
            ) {
                return res.status(400).json({
                    message:
                        "Year must be between 1 and 4"
                });
            }

            resource.year = numericYear;
        }

        if (semester !== undefined) {
            const numericSemester =
                Number(semester);

            if (
                !Number.isInteger(
                    numericSemester
                ) ||
                numericSemester < 1 ||
                numericSemester > 8
            ) {
                return res.status(400).json({
                    message:
                        "Semester must be between 1 and 8"
                });
            }

            resource.semester =
                numericSemester;
        }

        if (resourceType !== undefined) {
            resource.resourceType =
                resourceType;
        }

        const oldPublicId =
            resource.filePublicId;

        const oldResourceType =
            resource.fileResourceType;

        let replacingCloudinaryFile = false;

        if (fileUrl !== undefined) {
            resource.fileUrl =
                fileUrl.trim();
        }

        if (filePublicId !== undefined) {
            resource.filePublicId =
                filePublicId.trim();

            replacingCloudinaryFile =
                oldPublicId &&
                oldPublicId !==
                    filePublicId.trim();
        }

        if (fileResourceType !== undefined) {
            resource.fileResourceType =
                fileResourceType.trim();
        }

        const updatedResource =
            await resource.save();

        /*
         * Delete the previous Cloudinary file only
         * after the MongoDB update succeeds.
         *
         * If the old resource was an external URL,
         * oldPublicId will be empty and nothing happens.
         */
        if (replacingCloudinaryFile) {
            await deleteCloudinaryFile(
                oldPublicId,
                oldResourceType
            );
        }

        const populatedResource =
            await updatedResource.populate(
                "uploadedBy",
                "name email profileImage department year"
            );

        return res.status(200).json({
            message:
                "Academic resource updated successfully",
            resource: populatedResource
        });
    } catch (error) {
        console.error(
            "Update academic resource error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while updating academic resource"
        });
    }
};

const deleteResource = async (req, res) => {
    try {
        const resource =
            await AcademicResource.findById(
                req.params.id
            );

        if (!resource) {
            return res.status(404).json({
                message:
                    "Academic resource not found"
            });
        }

        if (
            resource.uploadedBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only delete your own resources"
            });
        }

        const publicId =
            resource.filePublicId;

        const resourceType =
            resource.fileResourceType;

        await resource.deleteOne();

        if (publicId) {
            await deleteCloudinaryFile(
                publicId,
                resourceType
            );
        }

        return res.status(200).json({
            message:
                "Academic resource deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete academic resource error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while deleting academic resource"
        });
    }
};

module.exports = {
    createResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResource
};