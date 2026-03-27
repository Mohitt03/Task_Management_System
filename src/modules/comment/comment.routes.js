const Router = require('express')
const router = Router()

const { addComment, getComment, getCommentUser, updateComment } = require('./comment.controller')
const rbacMiddleware = require('../../middlewares/rbac.middleware')
const verifyJWT = require('../../middlewares/auth.middleware')
// const PlanValidation = require('../validations/planValidation')

// Creating Task Using Task  Id
router.route("/create/:id").post(addComment);

//Get Comments By Task Id
router.route("/get/:id").get(getComment);

// Get Comments By User Id
router.route("/get/User/:id").get(getCommentUser);

// Update Comments
router.route("/:id").put(updateComment);


module.exports = router