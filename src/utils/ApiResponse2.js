class ApiResponse {
    constructor(
        res,
        statusCode,
        data = null,
        message = "Success"
    ) {
        return res.status(statusCode).json({
            success: true,
            statusCode,
            message,
            data,
            errors: null
        });
    }
}

module.exports = ApiResponse;