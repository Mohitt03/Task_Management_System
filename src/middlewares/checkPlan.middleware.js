const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const Subscription = require("../modules/plan/plan.models.js");
const Project = require("../modules/project/project.models.js");
const User = require("../modules/user/user.model.js");
const Company = require('../modules/company/company.model.js')

// ─── Internal helper ──────────────────────────────────────────────────────────

/**
 * Fetches the company's active subscription and validates it.
 * Throws a descriptive ApiError if missing or expired.
 */
const getActiveSubscription = async (company_Id) => {

    const company = await Company.findById(company_Id)
    const planId = company.planId;
    console.log(planId);

    const subscription = await Subscription.findById(planId);
    console.log("subscription:- ", subscription);

    if (!subscription) {
        throw new ApiError(403, "No active subscription found. Please subscribe to a plan to continue.");
    }

    // Guard against expired subscriptions that weren't marked by a cron job yet
    if (new Date() > new Date(subscription.expires_at)) {
        throw new ApiError(403, "Your subscription has expired. Please renew to continue.");
    }

    return subscription;
};

// ─── Middleware Factory ───────────────────────────────────────────────────────

/**
 * checkPlanLimit(resource)
**/
const checkPlanLimit = (resource) => {
    return asyncHandler(async (req, res, next) => {
        const company_Id = req.user?.company_Id;
        console.log("CheckPlan", req.user);

        if (!company_Id) {
            throw new ApiError(400, "Company context is missing from the request");
        }

        // ── 1. Fetch active subscription ──────────────────────────────────────
        const subscription = await getActiveSubscription(company_Id);

        // ── 2. Resolve the applicable limit ───────────────────────────────────
        // Prefer the snapshot taken at purchase time; fall back to live plan values
        const snapshot = subscription.limits || {};
        console.log(snapshot);

        let limit;
        let currentCount;
        let resourceLabel;

        switch (resource) {

            // ── Projects ──────────────────────────────────────────────────────
            case "projects": {
                limit = snapshot.maxProjects
                resourceLabel = "projects";

                if (limit === null || limit === undefined) {
                    throw new ApiError(500, "Plan limit configuration is missing for projects");
                }

                // Unlimited plans (stored as -1 or Infinity in snapshot)
                if (limit === -1 || limit === Infinity) return next();

                currentCount = await Project.countDocuments({ company_Id });
                console.log(currentCount);

                if (currentCount >= limit) {
                    throw new ApiError(403,
                        `Your ${subscription.plan_Id?.display_name || "current"} plan allows a maximum of ${limit} project${limit === 1 ? "" : "s"}. ` +
                        `You have reached this limit. Please upgrade your plan to create more projects.`
                    );
                }

                break;
            }

            // ── Users (seats) ─────────────────────────────────────────────────
            case "users": {
                limit = snapshot.maxUsers;
                resourceLabel = "users";
                console.log("maxUsers", snapshot.maxUsers, company_Id);


                if (limit === null || limit === undefined) {
                    throw new ApiError(500, "Plan limit configuration is missing for users");
                }

                if (limit === -1 || limit === Infinity) return next();

                // Count all non-deleted users belonging to this company
                currentCount = await User.countDocuments({
                    createdBy: req.user.id,
                    isActive: "true",
                });
                console.log("Check Plan", currentCount);


                if (currentCount >= limit) {
                    throw new ApiError(403,
                        `Your ${subscription.plan_Id?.display_name || "current"} plan allows a maximum of ${limit} user seat${limit === 1 ? "" : "s"}. ` +
                        `You have reached this limit. Please upgrade your plan to invite more users.`
                    );
                }

                break;
            }

            default:
                throw new ApiError(500, `Unknown resource type "${resource}" passed to checkPlanLimit`);
        }

        // ── 3. Attach subscription context for downstream use if needed ───────
        req.subscription = subscription;
        req.planLimits = { limit, currentCount, resource: resourceLabel };

        next();
    });
};

module.exports = { checkPlanLimit, getActiveSubscription };