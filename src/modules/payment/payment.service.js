const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Plan = require("../plan/plan.models");
const Order = require("../order/order.model");
const User = require("../user/user.model");
const Company = require("../company/company.model")

const createCheckoutSessionService = async (productId, adminId, companyId) => {
    console.log("Payment Service:", productId, adminId, companyId);

    const product = await Plan.findById(productId);

    if (!product) {
        throw new Error("Plan not found");
    }
    console.log(product.price.currency);


    // Create order first
    const order = await Order.create({
        planId: productId,
        userId: adminId,
        companyId: companyId,
        amount: product.price.monthly,
        currency: product.price.currency,
        status: "pending",
        items: [{ planId: productId }]
    });


    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",

        line_items: [
            {
                price_data: {
                    currency: product.price.currency,
                    unit_amount: product.price.monthly,
                    product_data: {
                        name: product.name
                    }
                },
                quantity: 1
            }
        ],
        metadata: {
            orderId: order._id.toString(),
            planId: productId.toString(),
            planDuration: product.durationDays,
            userId: adminId.toString(),
            companyId: companyId.toString()
        },

        success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/cancel`
    });

    const company = await Company.findById(companyId)

    // Save stripe session id
    order.stripeSessionId = session.id;


    await order.save();

    company.stripeSessionId = session.id;
    await company.save();

    return session.url;
};


const handleStripeWebhookService = async (body, signature) => {
    let event;

    // console.log("Hitting the stripe webhook route in service");

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        throw new Error(`Webhook signature failed: ${err.message}`);
    }

    console.log("🔥 Webhook received:", event.type);

    if (event.type === "checkout.session.completed") {

        console.log("🎉 Payment Success from Webhook!");

        const session = event.data.object;

        console.log("Session Metadata:", session.metadata);

        const { orderId, userId, planId, planDuration, companyId } = session.metadata;

        const email = session.customer_details?.email;

        console.log("Logging Ids:", orderId, userId, planId, companyId);



        const planStartDate = new Date();
        const planExpiryDate = new Date();

        const duration = Number(planDuration);

        planExpiryDate.setDate(planExpiryDate.getDate() + duration);

        console.log("Plan Duration:", duration);
        console.log("Plan starts:", planStartDate);
        console.log("Plan expires:", planExpiryDate);



        const [updatedOrder, updatedUser, updatedCompany] = await Promise.all([
            Order.findByIdAndUpdate(
                orderId,
                { email: email, status: "paid" },
                { new: true }
            ),

            User.findByIdAndUpdate(
                userId,
                { status: "active" },
                { new: true }
            ),

            Company.findByIdAndUpdate(
                companyId, // IMPORTANT
                {
                    status: "active",
                    planId,
                    planStartDate,   // ← ADD
                    planExpiryDate,
                },
                { new: true }
            )
        ]);

        console.log("Updated Order:", updatedOrder);
        console.log("Updated User:", updatedUser);
        console.log("Updated Company:", updatedCompany);

        return {
            updatedOrder,
            updatedUser,
            updatedCompany
        };
    }

    return null;
};

module.exports = {
    createCheckoutSessionService, handleStripeWebhookService
};