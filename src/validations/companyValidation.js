const Joi = require('joi');
const ApiError = require('../utils/ApiError')

const companyValidation = (req, res, next) => {
    const { name } = req.body;
    const companyInfo = {
        name
    }



    const companyValidation = Joi.object({
        name: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required()
    });



    const { error } = companyValidation.validate(companyInfo);
    if (error) {
        console.log(error);

        throw new ApiError(422, `Validation Error ${error.details[0].message}`)

    };
    next()
}

module.exports = { companyValidation }