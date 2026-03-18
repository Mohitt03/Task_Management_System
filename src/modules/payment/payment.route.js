const express = require("express");
const router = express.Router();

const { createCheckoutSession, stripeWebhookController } = require("../controllers/payment.controller");
const verifyJWT = require("../middlewares/auth.middleware");

router.get("/create-checkout-session/:id", verifyJWT, createCheckoutSession);




router.post(
    "/",
    express.raw({ type: "application/json" }),
    stripeWebhookController
);

module.exports = router;





module.exports = router;