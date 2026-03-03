const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  const statusCode =
    err instanceof ApiError ? err.statusCode : 500;

  const message =
    err.message || "Internal Server Error";

    

  const errors =
    err instanceof ApiError ? err.errors : [];

  return res.status(statusCode).json({
    status: false,
    message,
    statusCode,
    data: null,
    errors,
  });
};

module.exports = errorHandler;
