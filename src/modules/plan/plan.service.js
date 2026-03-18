const Plan = require("./plan.models")

const createPlanService = (async (data) => {

    const plan = await Plan.create(data)

    return plan;

})


const updatePlanService = (async (planId, updateData) => {

    const plan = await Plan.findByIdAndUpdate(
        planId,
        updateData,
        { new: true }
    );

    return plan;
});


//  Soft Delete Plan
const deletePlanService = (async (id) => {

    return await Plan.findByIdAndUpdate(id,
        {
            isDelete: true,
            isActive: false
        },
        { new: true }
    );

});



module.exports = { createPlanService, updatePlanService, deletePlanService }