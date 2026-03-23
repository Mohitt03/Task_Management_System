const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
// const jwt = require("jsonwebtoken")
const User = require("../modules/user/user.model");
const Company = require("../modules/company/company.model");

const createError = require('http-errors')

const checkSubscriptionStatus = () => {
    return async (req, res, next) => {
        try {
            // Assuming req.user is already populated (via auth middleware)
            const user = req.user;
            

            if (!user) {
                return next(createError(401, "Unauthorized"));
            }

            // Check if user is Admin
            if (user.role === "Admin") {


                // Check Admin status
                if (user.status === "inactive") {
                    return next(
                        createError(403, "Your account is inactive. Please purchase a new subscription.")
                    );
                }

                const company = Company.findById(user.company_Id);

                if (!company) {
                    return next(createError(404, "Company not found"));
                }

                // Check Company status
                if (company.status === "inactive") {
                    return next(
                        createError(403, "Your company subscription is inactive. Please purchase a new subscription.")
                    );
                }
            }
            // Everything is fine
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = checkSubscriptionStatus;
