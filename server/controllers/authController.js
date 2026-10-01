const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const registerUser = async (req, res) => {
    try{
    const {
        name,
        email,
        password,
        department,
        year
    } = req.body;

    if (!name || !email || !password || !department || !year) {
        return res.status(400).json({
            message: "All required fields must be provided"
        });
    }
    const collegeEmailDomain = "@aktu.ac.in";

    if (!email.toLowerCase().endsWith(collegeEmailDomain)) {
        return res.status(400).json({
            message: "Please use your college email address"
        });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
        return res.status(409).json({
            message: "An account with this email already exists"
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        department,
        year
    });
    const token = generateToken(user._id);

const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    department: user.department,
    year: user.year,
    phone: user.phone,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
};

return res.status(201).json({
    message: "Registration successful",
    token,
    user: safeUser
});
}   catch (error) {
        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Server error during registration"
        });
    }};


    const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase();

        const collegeEmailDomain = "@aktu.ac.in";

        if (!normalizedEmail.endsWith(collegeEmailDomain)) {
            return res.status(400).json({
                message: "Please use your college email address"
            });
        }

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        

        const token = generateToken(user._id);

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            department: user.department,
            year: user.year,
            phone: user.phone,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        return res.status(200).json({
            message: "Login successful",
            token,
            user: safeUser
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Server error during login"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};