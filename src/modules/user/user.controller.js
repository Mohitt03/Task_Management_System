const User = require("./user.model")
const ApiError = require("../../utils/ApiError")
const ApiResponse = require("../../utils/ApiResponse2")
const asyncHandler = require("../../utils/asyncHandler")
const { getUserService, updateUserService, updateUserByAdmin, createUserService, deleteUserService } = require("./user.service")
// const { createUser } = require("./admin.controller")

//Getting User
const getUsers = asyncHandler(async (req, res) => {
    let user = req.user;
    const result = await getUserService(req.query, user);

    return new ApiResponse(
        res,
        200,
        result,
        "Fetch Successfully"
    );
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

//Updating User
const updateUsers = asyncHandler(async (req, res) => {
    // console.log(req.params.id, req.body, req.user);


    let result = await updateUserService(req.body, req.user)


    return new ApiResponse(
        res, 200, result, "Updated Succesfully"
    )

})

const updateUsersByAdmin = asyncHandler(async (req, res) => {

    let result = await updateUserByAdmin(req.params.id, req.body, req.user)


    return new ApiResponse(
        res, 200, result, "Updated Succesfully"
    )

})

// Soft Deleting User
const softDeleteUser = asyncHandler(async (req, res) => {
    const response = await deleteUserService(req.params.id, req.user)
    return new ApiResponse(res, 200, response, "Deleted Succesfully")
})

// Hard Deleting User
const hardDeleteUser = asyncHandler(async (req, res) => {
    const response = await deleteUserService(req.params.id)
    return new ApiResponse(res, 200, response, "Deleted Succesfully")
})

module.exports = { getUsers, updateUsers, updateUsersByAdmin, createUser, softDeleteUser, hardDeleteUser }