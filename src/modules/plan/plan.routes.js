const Router = require('express')
const router = Router()

const { getPlan, createPlan, updatePlan, deletePlan } = require('./plan.controller')
const rbacMiddleware = require('../../middlewares/rbac.middleware')
const verifyJWT = require('../../middlewares/auth.middleware')
const PlanValidation = require('../../validations/planValidation')

router.route("/get").get(verifyJWT, getPlan)
router.route("/create").post(PlanValidation, verifyJWT, rbacMiddleware(["S_Admin"]), createPlan)
router.route("/update/:id").put(verifyJWT, rbacMiddleware(["S_Admin"]), updatePlan)
router.route("/delete/:id").delete(verifyJWT, rbacMiddleware(["S_Admin"]), deletePlan)


module.exports = router