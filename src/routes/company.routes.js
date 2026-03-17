const Router = require('express')
const router = Router();


const { getCompany, createCompany, deleteCompany, updateCompany } = require("../controllers/company.controller.js");
const verifyJWT = require("../middlewares/auth.middleware.js");
const rbacMiddleware = require("../middlewares/rbac.middleware");
const { companyValidation } = require('../validations/companyValidation.js');

router.get("/", (req, res) => {
    console.log("Hello");
    res.end("Hello")

})

router.route("/create").post(verifyJWT, companyValidation, rbacMiddleware(["S_Admin", "Admin"]), createCompany)

//Getting all Company
router.route("/get").get(verifyJWT, rbacMiddleware(["Admin"]), getCompany)

router.route("/update/:id").put(rbacMiddleware(["Admin"]), updateCompany)

router.route("/delete/:id").delete(verifyJWT, rbacMiddleware(["S_Admin"]), deleteCompany)


module.exports = router;