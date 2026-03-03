const Company = require("../models/company.model");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse")
const ApiResponse2 = require("../utils/ApiResponse2")
const { getCompanyService } = require("../services/company.service");

// const getCompany = asyncHandler(async (req, res) => {

//     let {
//         page = 1,
//         limit,
//         sortKey = "createdAt",
//         sortOrder,
//         search,
//         ...filters
//     } = req.query;



//     // Checking if the limit is undefined or not a number then limit is set to 10
//     if (limit === undefined || typeof limit !== 'number') { limit = 10 }

//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);
//     const skip = (pageNumber - 1) * limitNumber;

//     // FILTER CONDITION
//     let matchStage = {
//         isActive: true,
//         isDelete: false
//     };

//     // Apply filters (multiple values supported)
//     Object.keys(filters).forEach(key => {
//         const values = filters[key].split(",");
//         matchStage[key] = { $in: values };
//     });


//     //Sortinng Conditions
//     const sortStage = {
//         [sortKey]: sortOrder === "asc" ? 1 : -1
//     };

//     //AGGREGATION PIPELINE 
//     const company = await Company.aggregate([
//         { $match: matchStage },
//         { $project: { isActive: 0, isDelete: 0 } },
//         { $sort: sortStage },
//         { $skip: skip },
//         { $limit: limitNumber }
//     ]);

//     // Total Count (with filters applied)
//     const totalRecords = await Company.aggregate([
//         { $match: matchStage },
//         { $count: "count" }
//     ]);

//     const count = totalRecords[0]?.count || 0;


//     return new ApiResponse2(
//         res,
//         200, {
//         count,
//         page: pageNumber,
//         limit: limitNumber,
//         company
//     }, "Fetch Succesfully"
//     )
// });


// Creating Company


const getCompany = asyncHandler(async (req, res) => {

    const result = await getCompanyService(req.query);

    return new ApiResponse2(
        res,
        200,
        result,
        "Fetch Successfully"
    );
});



const createCompany = asyncHandler(async (req, res) => {
    console.log(req.user);

    const { name, company_Id } = req.body;

    // Create Company
    const batch = await Company.create({
        name,
        company_Id,
        createdBy: req.user._id,
    });


    res.status(201).json({
        message: "Company created successfully",
        batch
    });


});


const deleteCompany = asyncHandler(async (req, res) => {

    const company = await Company.findById(req.params.id);

    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }


    // Soft Deleting
    await Company.findByIdAndUpdate(req.params.id, {
        isDelete: true,
        isActive: false
    });


    return res
        .status(200)
        .json(new ApiResponse(200, "Company deleted successfully"));

});

const updateCompany = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const data = await Company.findByIdAndUpdate(id, req.body,
        { new: true })

    res.status(200).json(
        new ApiResponse(
            200,
            {
                data
            },
            "Updated Successful"
        )
    );

})

const getCompanybyId = asyncHandler(async (req, res) => {

    const respone = await Company.find({ company_Id: req.user.company_Id })

    const Count = await Company.countDocuments();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                company: respone,
                Count
            },
            "Fetch Successful"
        )
    );
});

module.exports = { getCompany, getCompanybyId, createCompany, deleteCompany, updateCompany }