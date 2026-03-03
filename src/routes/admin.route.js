const Router = require('express')
const router = Router();


const { createAdmin, createUser, loginAdmin } = require("../controllers/admin.controller.js");
const verifyJWT = require("../middlewares/auth.middleware.js");
const rbacMiddleware = require("../middlewares/rbac.middleware");
// const { userValidation } = require('../validations/userValidation.js');

router.get("/", (req, res) => {
    console.log("Hello");
    res.end("Hello")

})

//SuperAdmin can create an Admin, User or S_Admin
router.route("/create/S_Admin").post(verifyJWT, rbacMiddleware(["S_Admin"]), createAdmin)

// Admin can only create only User
router.route("/create/Admin").post(verifyJWT, rbacMiddleware(["Admin"]), createUser)


module.exports = router;