const Router = require('express')
const router = Router();


const { getCompany, getCompanybyId, createCompany, deleteCompany, updateCompany } = require("../controllers/company.controller.js");
const verifyJWT = require("../middlewares/auth.middleware.js");
const rbacMiddleware = require("../middlewares/rbac.middleware");
// const { userValidation } = require('../validations/userValidation.js');

router.get("/", (req, res) => {
    console.log("Hello");
    res.end("Hello")

})

router.route("/create").post(verifyJWT, rbacMiddleware(["S_Admin"]), createCompany)

//Getting all Company
router.route("/get").get(verifyJWT, rbacMiddleware(["S_Admin"]), getCompany)

// Getting Company By Assigned Company Id
router.route("/getby").get(verifyJWT, getCompanybyId)

router.route("/delete/:id").delete(verifyJWT, rbacMiddleware(["S_Admin"]), deleteCompany)
router.route("/update/:id").put(verifyJWT, rbacMiddleware(["S_Admin"]), updateCompany)

// router.route("/verfiyOtp").post(verifyOtp)

// //secured routes
// router.route("/logout").post(verifyJWT, logoutUser)
// router.get('/testing', verifyJWT, (req, res) => {
//     console.log("req.user", req.user);

//     console.log("Testing");
//     res.end("Testing")

// })
// router.route("/refresh-token").post(refreshAccessToken)

module.exports = router;