const express = require("express");
const router = express.Router();

const { getTaskHistory, getTask } = require("./history.controller");
const verifyJWT = require("../../middlewares/auth.middleware");
const rbacMiddleware = require("../..//middlewares/rbac.middleware")

//getting Task History using Task id 
router.get("/task/:id", rbacMiddleware(["Admin", "User"]), verifyJWT, getTaskHistory);


//getting Task History using User id 
router.get("/user/:id", rbacMiddleware(["Admin", "User"]), verifyJWT, getTask);

module.exports = router;