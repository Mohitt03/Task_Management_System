const User = require('../user/user.model.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ApiError = require('../../utils/ApiError')
// const ApiResponse = require('../utils/ApiResponse
const asyncHandler = require('../../utils/asyncHandler')

const ApiResponse = require("../../utils/ApiResponse");
const { registerUserService, loginUserService, verifyOtpService, logoutUserService, refreshAccessTokenService } = require("./auth.service.js");



const registerUser = asyncHandler(async (req, res) => {

    const createdUser = await registerUserService(req.body);

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );

});



const loginUser = asyncHandler(async (req, res) => {

    const { user, accessToken, refreshToken, loginToken } =
        await loginUserService(req.body);

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    };

    res.cookie("login_token", loginToken, {
        ...cookieOptions,
        maxAge: 5 * 60 * 1000
    });

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user,
                    TemporaryToken: loginToken,
                    AccessToken: accessToken,
                    RefreshToken: refreshToken
                },
                "User logged in successfully. OTP sent to email."
            )
        );
});



const verifyOtp = asyncHandler(async (req, res) => {

    const loginToken =
        req.cookies?.login_token ||
        req.header("Authorization")?.replace("Bearer ", "");

    const { otp } = req.body;

    const { accessToken, refreshToken } =
        await verifyOtpService({ loginToken, otp });

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("login_token", options)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "User logged In Successfully"
            )
        );
});



const logoutUser = asyncHandler(async (req, res) => {

    await logoutUserService(req.user._id);

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged Out")
        );
});


const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.body.refreshToken;

    const { accessToken, refreshToken } =
        await refreshAccessTokenService(incomingRefreshToken);

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed"
            )
        );
});




module.exports = {
    registerUser,
    loginUser,
    verifyOtp,
    logoutUser,
    refreshAccessToken
}