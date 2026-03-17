const Router = require('express')
const router = Router();


const { getUsers, updateUsers, createUser, createAdmin, deleteUser } = require("../controllers/user.controller.js");
const verifyJWT = require("../middlewares/auth.middleware.js");
const rbacMiddleware = require("../middlewares/rbac.middleware");
const { userValidation } = require('../validations/userValidation.js');
const { checkPlanLimit } = require('../middlewares/checkPlan.middleware.js');

router.get("/", (req, res) => {
    console.log("Hello");
    res.end("Hello this Users Route")

})

router.route("/get").get(getUsers)
router.route("/update/:id").put(verifyJWT, updateUsers)
router.route("/createUser/").post(verifyJWT, checkPlanLimit("users"), createUser)
router.route("/createAdmin/").post(verifyJWT, userValidation, createAdmin)
router.route("/delete/:id").delete(deleteUser)

//Getting all Company
// router.route("/get").get(verifyJWT, rbacMiddleware(["S_Admin"]), getCompany)

// // Getting Company By Assigned Company Id
// router.route("/getby").get(verifyJWT, getCompanybyId)

// router.route("/delete/:id").delete(verifyJWT, rbacMiddleware(["S_Admin"]), deleteCompany)
// router.route("/update/:id").put(verifyJWT, rbacMiddleware(["S_Admin"]), updateCompany)


module.exports = router;