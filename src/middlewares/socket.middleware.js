const socketMiddleware = (eventName, messageBuilder) => {
    return (req, res, next) => {
        try {
            const io = req.app.get("io");

            if (!io) {
                console.log("Socket.IO not initialized");
                return next();
            }

            // Build custom message dynamically
            const message =
                typeof messageBuilder === "function"
                    ? messageBuilder(req)
                    : messageBuilder;

            // Emit to all clients
            io.emit(eventName, message);

            next();
        } catch (error) {
            console.error("Socket Middleware Error:", error);
            next();
        }
    };
};

module.exports = socketMiddleware;