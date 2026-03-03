const { User } = require("../models/user.model.js");
const { ApiError } = require("../utils/ApiError.js");

 const createUserService = async ({
    name,
    email,
    password,
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
        role
    });

    return user;
};

module.exports = { createUserService }