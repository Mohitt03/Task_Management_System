const Router = require('express')
const router = Router();


const verifyJWT = require("../../middlewares/auth.middleware.js");
const rbacMiddleware = require("../../middlewares/rbac.middleware");
const { companyValidation } = require('../../validations/companyValidation.js');
const { getS_AdminDashboard, getAdminDashboard, getUserDashboard } = require('./dashboard.controller');

router.get('/s-admin', rbacMiddleware(["S_Admin"]), getS_AdminDashboard);
router.get('/admin', rbacMiddleware(["Admin"]), getAdminDashboard);
router.get('/user', rbacMiddleware(["User"]), getUserDashboard);

module.exports = router;
