const User = require("./user.model.js");
const ApiError = require("../../utils/ApiError.js");
const mongoose = require('mongoose')

const getUserService = async (queryParams, userData) => {

    let {
        page = 1,
        limit = 10,
        sortKey = "createdAt",
        sortOrder = "desc",
        search,
        get,
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

    // Role-based filtering
    if (get === "Admin") {
        matchStage.role = "Admin";
    } else if (get === "User") {
        matchStage.role = "User";
    }


    // Access control
    if (userData.role === "Admin") {
        matchStage.createdBy = userData._id;
    } else if (userData.role !== "S_Admin") {
        matchStage.company_id = userData.company_id;
    }

    // 👇 dynamic filters
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

    // 👇 search
    if (search) {
        matchStage.name = { $regex: search, $options: "i" };
    }

    // Sort condition
    const sortStage = {
        [sortKey]: sortOrder === "asc" ? 1 : -1
    };
    console.log("User Model", User);

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
        role,
        status: "active"
    });

    return user;
};


const updateUserService = async (updateData, userData) => {

    if (!userData._id) {
        throw new ApiError(400, "User Id not found");
    }


    console.log("User Service", userData);


    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });


    // 👉 USER LOGIC

    // ❌ Prevent restricted fields
    delete updateData.company_Id;
    delete updateData.role;

    const updatedUser = await User.findByIdAndUpdate(
        userData._id,
        { $set: updateData },
        { new: true, runValidators: true }
    );


    return updatedUser;
};

const updateUserByAdmin = async (userId, updateData, currentUser) => {
    if (!userId) {
        throw new ApiError(400, "User Id not found");
    }

    // Find existing user
    const existingUser = await User.findById(userId);


    assertOwner(currentUser._id, existingUser.createdBy);


    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }
    console.log(currentUser._id === existingUser.createdBy);

    // ✅ Admin can only update users created by them
    if (String(currentUser._id) !== String(existingUser.createdBy)) {
        throw new ApiError(401, "Admin is not allowed to update this user");
    }

    // ❌ Restrict fields
    delete updateData.password;
    delete updateData.company_Id;

    // 🔥 Remove undefined fields
    Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    return updatedUser;
};


const deleteUserService = async (targetUserId, currentUserData) => {

    if (!targetUserId) {
        throw new ApiError(400, "User Id not found");
    }


    // ✅ Admin can only delete users created by them
    if (String(currentUserData._id) !== String(targetUserId)) {
        throw new ApiError(401, "Admin is not allowed to delete this user");
    }

    // Find target user
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
        throw new ApiError(404, "User not found");
    }

    await softDelete(targetUserId)

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

module.exports = { getUserService, createUserService, updateUserService, updateUserByAdmin, deleteUserService }