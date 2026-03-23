const Router = require('express')
const router = Router();


const { getUsers, updateUsers, updateUsersByAdmin, createUser, softDeleteUser } = require("./user.controller.js");
const verifyJWT = require("../../middlewares/auth.middleware.js");
const rbacMiddleware = require("../../middlewares/rbac.middleware");
const { userValidation } = require('../../validations/userValidation.js');
const { checkPlanLimit } = require('../../middlewares/checkPlan.middleware.js');



router.route("/get").get(verifyJWT, rbacMiddleware(["S_Admin", "Admin"]), getUsers);
router.route("/update/").put(verifyJWT, rbacMiddleware(["User"]), updateUsers);
router.route("/adminUpdate/:id").put(verifyJWT, rbacMiddleware(["Admin", "User"]), updateUsersByAdmin);
router.route("/createUser/").post(verifyJWT, rbacMiddleware(["Admin"]), checkPlanLimit("users"), userValidation, createUser);
router.route("/delete/:id").delete(verifyJWT, rbacMiddleware(["Admin"]), softDeleteUser);

module.exports = router;