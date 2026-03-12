const User = require("../models/user.model")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse2")
const asyncHandler = require("../utils/asyncHandler")
const { getUserService, updateUserService, createUserService, deleteUserService } = require("../services/user.service")
// const { createUser } = require("./admin.controller")



const getUsers = asyncHandler(async (req, res) => {

    const result = await getUserService(req.query);

    return new ApiResponse(
        res,
        200,
        result,
        "Fetch Successfully"
    );
});


// Creating Admin by Super Admin
const createAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const admin = await createUserService({
        name,
        email,
        password,
        role

    });

    return new ApiResponse(res, 200, admin, `${role} created Successfully`);
});


// Creating User by Admin
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    let createdBy = req.user._id;
    const user = await createUserService({
        name,
        email,
        password,
        createdBy,
        role: "User"

    });

    return new ApiResponse(res, 200, user, "User created Successfully");
});


const updateUsers = asyncHandler(async (req, res) => {
    console.log(req.params.id, req.body, req.user.role);

    const result = await updateUserService(req.params.id, req.body, req.user.role)

    return new ApiResponse(
        res, 200, result, "Updated Succesfully"
    )

})

const deleteUser = asyncHandler(async (req, res) => {
    const response = await deleteUserService(req.params.id)
    return new ApiResponse(res, 200, response, "Deleted Succesfully")
})

module.exports = { getUsers, updateUsers, createUser, createAdmin, deleteUser }