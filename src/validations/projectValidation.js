const Joi = require("joi");
const { companyValidation } = require("./companyValidation");
const ApiError = require("../utils/ApiError");



const projectValidation = (req, res, next) => {
    const {
        name,
        short_code,
        task_counter,
        description,
        company_Id,
        created_by,
        members,
        status
        , priority, start_date,
        due_date, completed_at, tags
    } = req.body;

    const projectInfo = {
        name,
        short_code,
        task_counter,
        description,
        company_Id,
        created_by,
        members,
        status
        , priority, start_date,
        due_date, completed_at, tags
    }

    const projectValidationSchema = Joi.object({
        name: Joi.string()
            .trim()
            .min(2)
            .max(200)
            .required(),

        short_code: Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(10)
            .required(),

        task_counter: Joi.number()
            .integer()
            .min(0)
            .default(0),

        description: Joi.string()
            .trim()
            .allow("", null),

        company_Id: Joi.string()
            .required()
            .custom(objectId, "ObjectId validation"),

        created_by: Joi.string()
            .required()
            .custom(objectId, "ObjectId validation"),

        members: Joi.array().items(
            Joi.object({
                user_Id: Joi.string()
                    .required()
                    .custom(objectId, "ObjectId validation"),

                joined_at: Joi.date()
                    .default(Date.now),
            })
        ),

        status: Joi.string()
            .valid("planning", "active", "on_hold", "completed", "archived")
            .default("planning"),

        priority: Joi.string()
            .valid("low", "medium", "high", "critical")
            .default("medium"),

        start_date: Joi.date(),

        due_date: Joi.date(),

        completed_at: Joi.date(),

        tags: Joi.array().items(
            Joi.string().trim()
        ),
    });




    const { error } = projectValidation.validate(projectInfo);
    if (error) {
        console.log(error);

        throw new ApiError(422, `Validation Error ${error.details[0].message}`)

    }
}



module.exports = { projectValidation };