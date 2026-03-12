const Joi = require("joi");
const ApiError = require("../utils/ApiError");

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);


const TaskValidation = (req, res, next) => {
    const {
        title,
        description,
        project_Id,
        company_Id,
        assigned_to,
        report_to,
        created_by,
        priority,
        status,
        due_date,
        tags
    } = req.body;

    const taskInfo = {
        title,
        description,
        project_Id,
        company_Id,
        assigned_to,
        report_to,
        created_by,
        priority,
        status,
        due_date,
        tags,
    }

    const taskValidationSchema = Joi.object({

        title: Joi.string()
            .trim()
            .required(),

        description: Joi.string()
            .trim()
            .allow("", null),

        project_Id: objectId.required(),

        company_Id: objectId.required(),

        assigned_to: objectId.allow(null),

        created_by: objectId.required(),

        priority: Joi.string()
            .valid("low", "medium", "high")
            .default("medium"),

        status: Joi.string()
            .valid(
                "to-do",
                "in-progress",
                "done",
                "testing",
                "qa-verified",
                "re-open",
                "deployment"
            )
            .default("to-do"),

        due_date: Joi.date()
            .allow(null),

        completed_at: Joi.date()
            .allow(null),

        tags: Joi.array().items(
            Joi.string().trim()
        ).default([])
    });


    const { error } = taskValidationSchema.validate(taskInfo);
    if (error) {
        console.log(error);
        throw new ApiError(422, `Validation Error ${error.details[0].message}`)
    };
    next()


}



module.exports = { TaskValidation };