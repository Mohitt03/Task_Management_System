const express = require("express");
const router = express.Router();

const { getTaskHistory } = require("./history.controller");
const verifyJWT = require("../../middlewares/auth.middleware");

//getting one task history
router.get("/:id", verifyJWT, getTaskHistory);

module.exports = router;