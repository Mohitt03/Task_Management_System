const Joi = require("joi");
const ApiError = require('../utils/ApiError')




const PlanValidation = (req, res, next) => {
    const { name, description, price, limits, isActive } = req.body;

    const planInfo = {
        name,
        description,
        price,
        limits,
        isActive
    };

    const PlanValidation = Joi.object({
        name: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required(),

        description: Joi.string()
            .trim()
            .max(500)
            .optional(),

        price: Joi.object({
            monthly: Joi.number()
                .min(0)
                .required(),

            yearly: Joi.number()
                .min(0)
                .required(),

            currency: Joi.string()
                .length(3)
                .uppercase()
                .required()
        }).required(),

        limits: Joi.object({
            maxCompanies: Joi.number()
                .integer()
                .min(1)
                .required(),

            maxProjects: Joi.number()
                .integer()
                .min(1)
                .required(),

            maxTasksPerProject: Joi.number()
                .integer()
                .min(1)
                .required(),

            maxUsers: Joi.number()
                .integer()
                .min(1)
                .required()
        }).required(),

        isActive: Joi.boolean().optional(),

        isDelete: Joi.boolean().optional()
    });



    const { error } = PlanValidation.validate(planInfo);
    if (error) {
        console.log(error);

        throw new ApiError(422, `Validation Error ${error.details[0].message}`)

    };
    next()
}

module.exports = PlanValidation;