const User = require("../models/user.model");
const Company = require("../models/company.model.js");
const ApiError = require("../utils/ApiError");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { generateAccessAndRefereshTokens } = require("../utils/generateAccessAndRefereshTokens.js")


const registerUserService = async ({ email, name, password, role, companyData }) => {

    // validation
    if ([email, name, password, role].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    // check existing user
    const existedUser = await User.findOne({
        $or: [{ name }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or name already exists");
    }

    let company = {}
    let user = {}
    let data = []
    if (role === "Admin") {
        console.log(companyData);

        //creating company
        company = await Company.create(companyData)

        // create user
        user = await User.create({
            company_Id: company._id,
            name: name.toLowerCase(),
            email,
            password,
            role
        });

        data = [company, user]
    }
    if (role === "S_Admin") {

        // create user
        user = await User.create({
            name: name.toLowerCase(),
            email,
            password,
            role
        });
        data = [user]

    }

    return data;
};


const loginUserService = async ({ email, name, password }) => {

    if (name) {
        name = name.toLowerCase();
    }

    if (!name && !email) {
        throw new ApiError(400, "name or email is required");
    }

    const user = await User.findOne({
        $or: [{ name }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate OTP
    const otp = crypto.randomBytes(3).toString("hex");

    user.otp = otp;
    await user.save({ validateBeforeSave: false });

    // Send OTP Email
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });
    console.log(process.env.MAIL_USER, process.env.MAIL_PASS);

    const mailOptions = {
        to: user.email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    // Temporary login token
    const loginToken = jwt.sign(
        { userId: user._id },
        process.env.LOGIN_TOKEN_SECRET,
        { expiresIn: "5m" }
    );

    const { accessToken, refreshToken } =
        await generateAccessAndRefereshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return {
        user: loggedInUser,
        accessToken,
        refreshToken,
        loginToken
    };
};



const verifyOtpService = async ({ loginToken, otp }) => {

    if (!loginToken) {
        throw new ApiError(401, "Session expired");
    }

    // decode login token
    const decoded = jwt.verify(
        loginToken,
        process.env.LOGIN_TOKEN_SECRET
    );

    const userId = decoded.userId;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // verify otp
    if (user.otp !== otp) {
        throw new ApiError(401, "Wrong OTP or expired");
    }

    // remove otp
    await User.findByIdAndUpdate(userId, {
        $unset: { otp: 1 }
    });

    // generate tokens
    const { accessToken, refreshToken } =
        await generateAccessAndRefereshTokens(user._id);

    return {
        accessToken,
        refreshToken
    };
};


const logoutUserService = async (userId) => {

    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    await User.findByIdAndUpdate(
        userId,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { new: true }
    );

    return true;
};

const refreshAccessTokenService = async (incomingRefreshToken) => {

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefereshTokens(user._id);

        return {
            accessToken,
            refreshToken: newRefreshToken
        };

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
};


module.exports = {
    registerUserService, loginUserService, verifyOtpService, logoutUserService, refreshAccessTokenService
};