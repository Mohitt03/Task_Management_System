const express = require('express')
const router = express.Router();
const User = require('../models/user.model.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')
const ApiResponse2 = require('../utils/ApiResponse2.js')
const asyncHandler = require('../utils/asyncHandler')
const nodemailer = require('nodemailer')
const crypto = require('crypto');
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { log } = require('console');


const { createUserService } = require("../services/user.service.js");

// Creating Admin by Super Admin
const createAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const admin = await createUserService({
        name,
        email,
        password,
        role

    });

    return new ApiResponse2(res, 200, admin, `${role} created Successfully`);
});


// Creating User by Admin
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const user = await createUserService({
        name,
        email,
        password,
        role: "User"

    });

    return new ApiResponse2(res, 200, user, "User created Successfully");
});




module.exports = { createAdmin, createUser }