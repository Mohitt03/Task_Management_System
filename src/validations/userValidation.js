const Joi = require('joi');
const ApiError = require('../utils/ApiError')

const userValidation = (req, res, next) => {
    const { name, role, email, password, } = req.body;
    const userInfo = {
        name,
        email,
        password,
        role,
    }



    const userValidation = Joi.object({
        name: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required(),

        email: Joi.string()
            .email()
            .lowercase()
            .required(),

        password: Joi.string()
            .min(6)
            .max(128)
            .required(),

        role: Joi.string()
            .valid("S_Admin", "Admin", "User")
            .required()
    });



    const { error } = userValidation.validate(userInfo);
    if (error) {
        console.log(error);

        throw new ApiError(422, `Validation Error ${error.details[0].message}`)

    };
    next()
}

module.exports = { userValidation }