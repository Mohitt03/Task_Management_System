const ApiError = require("../utils/ApiError");

const rbacMiddleware = (roles) => {
    return (req, res, next) => {
        console.log(req.user);

        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "Forbidden: You do not have access")
        }
        next();
    };
};

module.exports = rbacMiddleware;
