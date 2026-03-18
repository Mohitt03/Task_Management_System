const Company = require("./company.model");
const User = require("../user//user.model");
const asyncHandler = require("../../utils/asyncHandler")
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse")
const ApiResponse2 = require("../../utils/ApiResponse2")
const { getCompanyService, createCompanyService, updateCompanyService, deleteCompanyService } = require("./company.service");



const getCompany = asyncHandler(async (req, res) => {
    let user = req.user;
    const result = await getCompanyService(req.query, user);

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


    let user = req.user;
    const response = await updateCompanyService(user, req.body)

    return new ApiResponse2(res, 200, response, "Data Updated Succesfully")

})


const deleteCompany = asyncHandler(async (req, res) => {
    let user = req.user;
    let response = await deleteCompanyService(user)

    if (!response) {
        return res.status(404).json({ message: "Company not found" });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Company deleted successfully"));

});


module.exports = { getCompany, createCompany, deleteCompany, updateCompany }