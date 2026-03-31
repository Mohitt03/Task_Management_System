const ApiError = require("../../utils/ApiError");
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse2')
const { getS_AdminDashboardService, getAdminDashboardService, getUserDashboardService } = require('./dashboard.service');

const getS_AdminDashboard = asyncHandler(async (req, res) => {
    const result = await getS_AdminDashboardService();
    res.json({ message: result });
});

const getAdminDashboard = asyncHandler(async (req, res) => {
    const result = await getAdminDashboardService(req.user);
    res.json({ message: result });
});

const getUserDashboard = asyncHandler(async (req, res) => {
    const result = await getUserDashboardService(req.user);
    res.json({ message: result });
});

module.exports = { getS_AdminDashboard, getAdminDashboard, getUserDashboard }