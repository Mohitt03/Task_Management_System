const paymentService = require("../services/payment.service");
const ApiResponse = require("../utils/ApiResponse2");
const { createCheckoutSessionService, handleStripeWebhookService } = require("../services/payment.service");




const createCheckoutSession = async (req, res) => {
    try {

        const productId = req.params.id;
        console.log(req.user);

        const adminId = req.user._id;
        const companyId = req.user.company_Id
        console.log("Payment Controller", productId, adminId);

        const sessionUrl = await createCheckoutSessionService(productId, adminId, companyId);

        // res.redirect(sessionUrl);
        return new ApiResponse(res, 200, { stripePaymentGatewayLink: sessionUrl }, "Session url is succesfully genrated")

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};




const stripeWebhookController = async (req, res) => {
    try {
        const signature = req.headers["stripe-signature"];

        await handleStripeWebhookService(
            req.body,
            signature
        );

        return res.status(200).json({
            received: true
        });

    } catch (error) {
        console.error("Webhook Error:", error.message);

        return res.status(400).json({
            error: error.message
        });
    }
};



module.exports = {
    createCheckoutSession, stripeWebhookController
};