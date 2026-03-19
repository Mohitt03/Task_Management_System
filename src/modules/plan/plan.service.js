const ApiError = require("../../utils/ApiError");
const Plan = require("./plan.models")
const mongoose = require("mongoose");


const getPlanService = async (queryParams) => {
    let {
        page = 1,
        limit = 10,
        sortKey = "createdAt",
        sortOrder = "desc",
        search,
        ...filters
    } = queryParams;

    // Pagination
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Base match
    let matchStage = {
        isActive: true,
        isDelete: false
    };

    // 🔍 Dynamic filters
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            const values = filters[key].split(",");

            matchStage[key] = { $in: values };
        }
    });

    // 🔎 Search (on name)
    if (search) {
        matchStage.name = { $regex: search, $options: "i" };
    }

    // 🔃 Sorting
    const sortStage = {
        [sortKey]: sortOrder === "asc" ? 1 : -1
    };

    // ⚡ Aggregation
    const [plans, totalRecords] = await Promise.all([
        Plan.aggregate([
            { $match: matchStage },
            {
                $project: {
                    isActive: 0,
                    isDelete: 0
                }
            },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limitNumber }
        ]),
        Plan.aggregate([
            { $match: matchStage },
            { $count: "count" }
        ])
    ]);

    const count = totalRecords[0]?.count || 0;

    return {
        count,
        page: pageNumber,
        limit: limitNumber,
        plans
    };
};

const createPlanService = (async (data) => {

    const plan = await Plan.create(data)

    return plan;

})


const updatePlanService = async (planId, updateData) => {

    // ❌ Missing planId
    if (!planId) {
        throw new ApiError(400, "Plan ID is required");
    }

    // ❌ Invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(planId)) {
        throw new ApiError(400, "Invalid Plan ID");
    }

    // ❌ Empty update data
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No update data provided");
    }

    // ❌ Check if plan exists (and not deleted)
    const existingPlan = await Plan.findOne({
        _id: planId,
        isDelete: false
    });

    if (!existingPlan) {
        throw new ApiError(404, "Plan not found or already deleted");
    }

    // ✅ Update plan
    const updatedPlan = await Plan.findByIdAndUpdate(
        planId,
        updateData,
        {
            new: true,
            runValidators: true // 🔥 important
        }
    );

    return updatedPlan;
};



//  Soft Delete Plan
const deletePlanService = async (id) => {

    // ❌ Missing ID
    if (!id) {
        throw new ApiError(400, "Plan ID is required");
    }

    // ❌ Invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Plan ID");
    }

    // ❌ Check if plan exists
    const existingPlan = await Plan.findById(id);

    if (!existingPlan) {
        throw new ApiError(404, "Plan not found");
    }

    // ❌ Already deleted
    if (existingPlan.isDelete) {
        throw new ApiError(400, "Plan is already deleted");
    }

    // ✅ Soft delete
    const deletedPlan = await Plan.findByIdAndUpdate(
        id,
        {
            isDelete: true,
            isActive: false
        },
        { new: true }
    );

    return deletedPlan;
};




module.exports = { getPlanService, createPlanService, updatePlanService, deletePlanService }