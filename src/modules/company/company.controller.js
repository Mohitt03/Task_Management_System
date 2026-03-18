const Company = require("../models/company.model");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse")
const ApiResponse2 = require("../utils/ApiResponse2")
const { getCompanyService, createCompanyService, updateCompanyService, deleteCompanyService } = require("../services/company.service");



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

    const company = await createCompanyService({
        name,
        company_Id,
        userId: req.user._id
    });

    return res.status(201).json({
        message: "Company created successfully",
        company
    });

});


const updateCompany = asyncHandler(async (req, res) => {



    const response = await updateCompanyService(req.params.id, req.body)

    return new ApiResponse2(res, 200, response, "Data Updated Succesfully")

})


const deleteCompany = asyncHandler(async (req, res) => {

    let response = await deleteCompanyService(req.params.id)

    if (!response) {
        return res.status(404).json({ message: "Company not found" });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Company deleted successfully"));

});


module.exports = { getCompany, createCompany, deleteCompany, updateCompany }