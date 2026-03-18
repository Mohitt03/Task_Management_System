const Plan = require("./plan.models")

const { createPlanService, updatePlanService, deletePlanService } = require("./plan.service")
const ApiResponse = require("../../utils/ApiResponse2")
const asyncHandler = require("../../utils/asyncHandler")

const createPlan = (asyncHandler(async (req, res) => {

    let response = await createPlanService(req.body)

    return new ApiResponse(res, 200, response, "Plan is created succesfully")

}))

const updatePlan = (asyncHandler(async (req, res) => {
    let response = await updatePlanService(req.params.id, req.body)

    return new ApiResponse(res, 200, response, "Updated Succesfully")

}))


const deletePlan = (asyncHandler(async (req, res) => {

    let response = await deletePlanService(req.params.id)

    return new ApiResponse(res, 200, response, "Updated Succesfully")
}))


module.exports = { createPlan, updatePlan, deletePlan }