const Company = require("../models/company.model");
const ApiError = require("../utils/ApiError");
const mongoose = require('mongoose')

const getCompanyService = async (queryParams) => {

    let {
        page = 1,
        limit = 10,
        sortKey = "createdAt",
        sortOrder = "desc",
        search,
        ...filters
    } = queryParams;

    // Convert to numbers safely
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Default match condition
    let matchStage = {
        isActive: true,
        isDelete: false
    };

    // Apply dynamic filters
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            const values = filters[key].split(",");

            if (key === "_id") {
                matchStage[key] = {
                    $in: values.map(id => new mongoose.Types.ObjectId(id))
                };
            } else {
                matchStage[key] = { $in: values };
            }
        }
    });

    // Optional search (if needed)
    if (search) {
        matchStage.name = { $regex: search, $options: "i" };
    }

    // Sort condition
    const sortStage = {
        [sortKey]: sortOrder === "asc" ? 1 : -1
    };

    // Aggregation
    const [company, totalRecords] = await Promise.all([
        Company.aggregate([
            { $match: matchStage },
            { $project: { isActive: 0, isDelete: 0 } },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limitNumber }
        ]),
        Company.aggregate([
            { $match: matchStage },
            { $count: "count" }
        ])
    ]);

    const count = totalRecords[0]?.count || 0;

    return {
        count,
        page: pageNumber,
        limit: limitNumber,
        company
    };
};



const createCompanyService = async ({ name, company_Id, userId }) => {

    if (!name || !name.trim()) {
        throw new ApiError(400, "Company name is required");
    }

    // Optional: check if company already exists
    const existingCompany = await Company.findOne({ name });

    if (existingCompany) {
        throw new ApiError(409, "Company already exists");
    }

    const company = await Company.create({
        name,
        company_Id,
        S_Admin_Id: userId,
    });

    return company;
};


const updateCompanyService = async (id, data) => {

    const response = await Company.findByIdAndUpdate(id, data, { new: true })

    return response;

}

const deleteCompanyService = async (id) => {

    // Soft Deleting
    await Company.findByIdAndUpdate(id, {
        isDelete: true,
        isActive: false
    });

    let company = "Company is deleted"
    return company
}


module.exports = { getCompanyService, createCompanyService, updateCompanyService, deleteCompanyService };