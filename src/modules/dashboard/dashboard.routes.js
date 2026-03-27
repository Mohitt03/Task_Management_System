const Router = require('express')
const router = Router();


const verifyJWT = require("../../middlewares/auth.middleware.js");
const rbacMiddleware = require("../../middlewares/rbac.middleware");
const { companyValidation } = require('../../validations/companyValidation.js');
const { getS_AdminDashboard, getAdminDashboard, getUserDashboard } = require('./dashboard.controller');

router.get('/s-admin', getS_AdminDashboard);
router.get('/admin', getAdminDashboard);
router.get('/user', getUserDashboard);

module.exports = router;
