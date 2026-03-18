const Router = require('express')
const router = Router()

const { addComment, getComment } = require('../controllers/comment.controller')
const rbacMiddleware = require('../middlewares/rbac.middleware')
const verifyJWT = require('../middlewares/auth.middleware')
// const PlanValidation = require('../validations/planValidation')

router.route("/create/:id").post(verifyJWT, addComment);
router.route("/get/:id").get(verifyJWT, getComment);
// router.route("/update/:id").put(updatePlan)
// router.route("/delete/:id   ").delete(verifyJWT, rbacMiddleware(["S_Admin"]), deletePlan)


module.exports = router