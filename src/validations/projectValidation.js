const Joi = require("joi");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

const objectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid ObjectId");
    }
    return value;
};

const projectValidation = (req, res, next) => {

    const {
        name,
        task_counter,
        description,
        company_Id,
        created_by,
        members,
        status,
        priority,
        start_date,
        due_date,
        completed_at,
        tags
    } = req.body;

    const projectInfo = {
        name,
        task_counter,
        description,
        company_Id,
        created_by,
        members,
        status,
        priority,
        start_date,
        due_date,
        completed_at,
        tags
    };

    const projectValidationSchema = Joi.object({
        name: Joi.string().trim().min(2).max(200).required(),

        task_counter: Joi.number().integer().min(0).default(0),

        description: Joi.string().trim().allow("", null),

        company_Id: Joi.string().required().custom(objectId),

        created_by: Joi.string().required().custom(objectId),

        members: Joi.array().items(
            Joi.object({
                user_Id: Joi.string().required().custom(objectId),
                joined_at: Joi.date().default(Date.now),
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

        tags: Joi.array().items(Joi.string().trim()),
    });

    const { error } = projectValidationSchema.validate(projectInfo);

    if (error) {
        throw new ApiError(422, `Validation Error: ${error.details[0].message}`);
    }

    next(); // ✅ IMPORTANT
};

module.exports = { projectValidation };