const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const mongoose = require('mongoose')

const getUserService = async (queryParams) => {

    let {
        page = 1,
        limit = 10,
        sortKey = "createdAt",
        sortOrder = "desc",
        search,
        ...filters
    } = queryParams;

    // Convert to numbers safely
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Default match condition
    let matchStage = {
        isActive: true,
        isDelete: false
    };

    // Apply dynamic filters
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            const values = filters[key].split(",");

            if (key === "_id") {
                matchStage[key] = {
                    $in: values.map(id => new mongoose.Types.ObjectId(id))
                };
            } else {
                matchStage[key] = { $in: values };
            }
        }
    });

    // Optional search (if needed)
    if (search) {
        matchStage.name = { $regex: search, $options: "i" };
    }

    // Sort condition
    const sortStage = {
        [sortKey]: sortOrder === "asc" ? 1 : -1
    };

    // Aggregation
    const [user, totalRecords] = await Promise.all([
        User.aggregate([
            { $match: matchStage },
            { $project: { isActive: 0, isDelete: 0 } },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limitNumber }
        ]),
        User.aggregate([
            { $match: matchStage },
            { $count: "count" }
        ])
    ]);

    const count = totalRecords[0]?.count || 0;

    return {
        count,
        page: pageNumber,
        limit: limitNumber,
        user
    };
};



const createUserService = async ({
    name,
    email,
    password,
    createdBy,
    role
}) => {

    if ([email, name, password, role].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ name }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or name already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        createdBy,
        role
    });

    return user;
};


const updateUserService = async (userId, updateData, currentUserRole) => {

    if (!userId) {
        throw new ApiError(400, "User Id not found");
    }

    // Find existing user
    const existingUser = await User.findById(userId);

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    // Role-based update logic
    if (currentUserRole !== "S_Admin") {
        // Prevent non super-admin from updating role
        delete updateData.role;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    return updatedUser;
};


const deleteUserService = async (targetUserId) => {

    if (!targetUserId) {
        throw new ApiError(400, "User Id not found");
    }

    // Find target user
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
        throw new ApiError(404, "User not found");
    }

    await User.findByIdAndDelete(targetUserId)

};


// 🔥 Soft Delete Function
const softDelete = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            isDelete: true,
            isActive: false
        },
        { new: true }
    );
};

module.exports = { getUserService, createUserService, updateUserService, deleteUserService }