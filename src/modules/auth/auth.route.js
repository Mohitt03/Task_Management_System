const Router = require('express')
const router = Router();


const {
    loginUser,
    verifyOtp,
    logoutUser,
    registerUser,
    refreshAccessToken,
} = require("./auth.controller.js");
const verifyJWT = require("../../middlewares/auth.middleware.js");
const { userValidation } = require('../../validations/userValidation.js');

router.get("/", (req, res) => {
    console.log("Hello");
    res.end("Hello")

})

router.route("/signup").post(userValidation, registerUser)

router.route("/login").post(loginUser)

router.route("/verfiyOtp").post(verifyOtp)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.get('/testing', verifyJWT, (req, res) => {
    console.log("req.user", req.user);

    console.log("Testing");
    res.end("Testing")

})
router.route("/refresh-token").post(refreshAccessToken)

module.exports = router;