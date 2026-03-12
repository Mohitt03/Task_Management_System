const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('./payment.model');
const Company = require('../company/company.model');
const User    = require('../user/user.model');
const Plan    = require('../plan/plan.model');
const emailUtil = require('../../utils/email.util');

// ─────────────────────────────────────────────
// 1. Create Stripe Checkout Session
// ─────────────────────────────────────────────
const createCheckoutSession = async (company_id, plan_id) => {
  const company = await Company.findById(company_id);
  const plan    = await Plan.findById(plan_id);

  if (!company || !plan) throw new Error('Company or Plan not found');

  // Create or reuse Stripe customer
  let customerId = company.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: company.email,
      name:  company.name,
      metadata: { company_id: company_id.toString() },
    });
    customerId = customer.id;
    await Company.findByIdAndUpdate(company_id, { 
      stripe_customer_id: customerId 
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: plan.price * 100,     // Stripe uses cents
        recurring: { interval: 'month' },
        product_data: { name: plan.name },
      },
      quantity: 1,
    }],
    metadata: { 
      company_id: company_id.toString(), 
      plan_id: plan_id.toString() 
    },
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.FRONTEND_URL}/payment/cancel`,
  });

  return session;
};

// ─────────────────────────────────────────────
// 2. Process Webhook — Main Handler
// ─────────────────────────────────────────────
const processWebhook = async (rawBody, signature) => {
  // Verify the webhook is genuinely from Stripe
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new Error(`Stripe signature verification failed: ${err.message}`);
  }

  console.log(`Stripe event received: ${event.type}`);

  switch (event.type) {

    // ✅ Payment succeeded
    case 'checkout.session.completed':
      await handleCheckoutSuccess(event.data.object);
      break;

    // ✅ Subscription renewed successfully
    case 'invoice.payment_succeeded':
      await handleInvoiceSuccess(event.data.object);
      break;

    // ❌ Payment FAILED — Core of your question
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    // ❌ Subscription cancelled
    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object);
      break;

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }
};

// ─────────────────────────────────────────────
// 3. ✅ Handle Checkout Success
// ─────────────────────────────────────────────
const handleCheckoutSuccess = async (session) => {
  const { company_id, plan_id } = session.metadata;
  const plan = await Plan.findById(plan_id);

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + plan.duration_days);

  await Company.findByIdAndUpdate(company_id, {
    payment_status:        'paid',
    is_active:             true,
    plan_id:               plan_id,
    plan_expiry_date:      expiry,
    stripe_subscription_id: session.subscription,
  });

  // Activate all company users
  await User.updateMany(
    { company_id, role: { $ne: 'super_admin' } },
    { is_active: true }
  );

  await Payment.create({
    company_id,
    plan_id,
    stripe_customer_id:        session.customer,
    stripe_payment_intent_id:  session.payment_intent,
    stripe_subscription_id:    session.subscription,
    amount:   session.amount_total / 100,
    currency: session.currency,
    status:   'succeeded',
  });

  // Send confirmation email
  const company = await Company.findById(company_id);
  await emailUtil.sendPaymentSuccessEmail(company.email, {
    companyName: company.name,
    planName:    plan.name,
    expiryDate:  expiry,
  });
};

// ─────────────────────────────────────────────
// 4. ❌ Handle Payment FAILED — Your Main Case
// ─────────────────────────────────────────────
const handlePaymentFailed = async (invoice) => {
  const customerId = invoice.customer;
  const failureReason = invoice.last_payment_error?.message || 'Payment failed';

  // Find company by Stripe customer ID
  const company = await Company.findOneAndUpdate(
    { stripe_customer_id: customerId },
    {
      payment_status: 'failed',
      is_active:      false,        // ← Lock company
    },
    { new: true }
  );

  if (!company) {
    console.error(`No company found for Stripe customer: ${customerId}`);
    return;
  }

  // Deactivate ALL users under this company
  await User.updateMany(
    { company_id: company._id, role: { $ne: 'super_admin' } },
    { is_active: false }             // ← Lock all users
  );

  // Save failed payment record
  await Payment.create({
    company_id:            company._id,
    stripe_customer_id:    customerId,
    stripe_invoice_id:     invoice.id,
    stripe_subscription_id: invoice.subscription,
    amount:         invoice.amount_due / 100,
    currency:       invoice.currency,
    status:         'failed',
    failure_reason: failureReason,    // ← Store reason
  });

  // Find admin of the company to email
  const admin = await User.findOne({ 
    company_id: company._id, 
    role: 'admin' 
  });

  if (admin) {
    await emailUtil.sendPaymentFailedEmail(admin.email, {
      companyName:   company.name,
      failureReason: failureReason,
      retryUrl:      `${process.env.FRONTEND_URL}/billing/retry`,
    });
  }

  console.log(`Company ${company.name} locked due to payment failure`);
};

// ─────────────────────────────────────────────
// 5. ✅ Handle Invoice Success (renewal)
// ─────────────────────────────────────────────
const handleInvoiceSuccess = async (invoice) => {
  const customerId = invoice.customer;
  const company = await Company.findOne({ 
    stripe_customer_id: customerId 
  });

  if (!company) return;

  const plan = await Plan.findById(company.plan_id);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (plan?.duration_days || 30));

  await Company.findByIdAndUpdate(company._id, {
    payment_status:   'paid',
    is_active:        true,
    plan_expiry_date: expiry,
  });

  await User.updateMany(
    { company_id: company._id, role: { $ne: 'super_admin' } },
    { is_active: true }
  );
};

// ─────────────────────────────────────────────
// 6. ❌ Handle Subscription Cancelled
// ─────────────────────────────────────────────
const handleSubscriptionCancelled = async (subscription) => {
  const company = await Company.findOneAndUpdate(
    { stripe_subscription_id: subscription.id },
    { payment_status: 'unpaid', is_active: false },
    { new: true }
  );

  if (company) {
    await User.updateMany(
      { company_id: company._id, role: { $ne: 'super_admin' } },
      { is_active: false }
    );
  }
};

// ─────────────────────────────────────────────
// 7. Get Payment History
// ─────────────────────────────────────────────
const getHistory = async (company_id, query) => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find({ company_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('plan_id', 'name price'),
    Payment.countDocuments({ company_id }),
  ]);

  return { payments, meta: { page: Number(page), limit: Number(limit), total } };
};

module.exports = {
  createCheckoutSession,
  processWebhook,
  getHistory,
};



const handleStripeWebhookService = async (body, signature) => {
    let event;

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

    switch (event.type) {

        // ─────────────────────────────────────────
        // ✅ YOUR EXISTING CASE (unchanged)
        // ─────────────────────────────────────────
        case "checkout.session.completed": {
            console.log("🎉 Payment Success from Webhook!");

            const session = event.data.object;
            const { orderId, userId, planId, companyId } = session.metadata;
            const email = session.customer_details?.email;

            const [updatedOrder, updatedUser, updatedCompany] = await Promise.all([
                Order.findByIdAndUpdate(
                    orderId,
                    { email, status: "paid" },
                    { new: true }
                ),
                User.findByIdAndUpdate(
                    userId,
                    { status: "active" },
                    { new: true }
                ),
                Company.findByIdAndUpdate(
                    companyId,
                    { status: "active", planId },
                    { new: true }
                )
            ]);

            console.log("Updated Order:", updatedOrder);
            console.log("Updated User:", updatedUser);
            console.log("Updated Company:", updatedCompany);

            return { updatedOrder, updatedUser, updatedCompany };
        }

        // ─────────────────────────────────────────
        // ❌ NEW: Card declined / payment failed
        // Fires when: card is declined, insufficient funds,
        // authentication failed, etc.
        // ─────────────────────────────────────────
        case "payment_intent.payment_failed": {
            console.log("❌ Payment Intent Failed!");

            const paymentIntent = event.data.object;

            // Get failure reason from Stripe
            const failureReason =
                paymentIntent.last_payment_error?.message || "Payment failed";
            const failureCode =
                paymentIntent.last_payment_error?.code || "unknown";

            console.log("Failure reason:", failureReason);
            console.log("Failure code:", failureCode);

            // Find the order using stripeSessionId or paymentIntent id
            // payment_intent id is available on the session → look it up
            const order = await Order.findOneAndUpdate(
                { stripeSessionId: { $exists: true } }, // fallback find
                // Better: store paymentIntentId on order during checkout
                // We handle this below by finding via stripePaymentIntentId
            );

            // ── BETTER APPROACH ──────────────────────────────────────────
            // Store paymentIntentId on your Order during checkout (see fix below)
            // Then you can do:
            const failedOrder = await Order.findOneAndUpdate(
                { stripePaymentIntentId: paymentIntent.id },
                {
                    status: "failed",
                    failureReason: failureReason,
                    failureCode: failureCode,
                },
                { new: true }
            );

            if (!failedOrder) {
                console.log("No order found for payment intent:", paymentIntent.id);
                break;
            }

            // Lock company and user
            const [updatedCompany, updatedUser] = await Promise.all([
                Company.findByIdAndUpdate(
                    failedOrder.companyId,
                    { status: "payment_failed" },   // ← company locked
                    { new: true }
                ),
                User.findByIdAndUpdate(
                    failedOrder.userId,
                    { status: "inactive" },          // ← user locked
                    { new: true }
                )
            ]);

            // Send failure email to admin
            await sendPaymentFailedEmail(updatedUser.email, {
                companyName:   updatedCompany.name,
                failureReason: failureReason,
                retryUrl:      `${process.env.FRONTEND_URL}/billing/retry`
            });

            console.log("Company locked:", updatedCompany?.name);
            console.log("User deactivated:", updatedUser?.email);

            return { failedOrder, updatedCompany, updatedUser };
        }

        // ─────────────────────────────────────────
        // ❌ NEW: User abandoned / session timed out
        // Fires when: user closes tab, session expires (30 min)
        // ─────────────────────────────────────────
        case "checkout.session.expired": {
            console.log("⏰ Checkout Session Expired!");

            const session = event.data.object;
            const { orderId, userId, companyId } = session.metadata;

            // Mark order as expired, keep user/company inactive
            // (they were never activated so no need to deactivate)
            await Order.findByIdAndUpdate(
                orderId,
                { status: "expired" },
                { new: true }
            );

            console.log(`Order ${orderId} marked expired — user never paid`);

            // Optional: send "complete your payment" reminder email
            const user = await User.findById(userId);
            if (user) {
                await sendPaymentReminderEmail(user.email, {
                    retryUrl: `${process.env.FRONTEND_URL}/billing`
                });
            }

            return null;
        }

        // ─────────────────────────────────────────
        // ❌ NEW: Subscription renewal failed
        // Fires when: monthly renewal charge fails
        // (only relevant if you switch to subscription mode later)
        // ─────────────────────────────────────────
        case "invoice.payment_failed": {
            console.log("🔄❌ Subscription Renewal Failed!");

            const invoice = event.data.object;
            const customerId = invoice.customer;
            const failureReason =
                invoice.last_payment_error?.message || "Renewal payment failed";

            // Find company by stripeCustomerId
            const company = await Company.findOneAndUpdate(
                { stripeCustomerId: customerId },
                { status: "payment_failed" },
                { new: true }
            );

            if (!company) {
                console.log("No company found for customer:", customerId);
                break;
            }

            // Deactivate all users of this company
            await User.updateMany(
                { companyId: company._id },
                { status: "inactive" }
            );

            // Find admin to notify
            const admin = await User.findOne({
                companyId: company._id,
                role: "admin"
            });

            if (admin) {
                await sendPaymentFailedEmail(admin.email, {
                    companyName:   company.name,
                    failureReason: failureReason,
                    retryUrl:      `${process.env.FRONTEND_URL}/billing/retry`
                });
            }

            return { company };
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
            return null;
    }
};