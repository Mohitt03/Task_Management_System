let users = {}; // userId -> socketId

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Register user
        socket.on("register", (userId) => {
            users[userId] = socket.id;
        });

        socket.on("disconnect", () => {
            // Remove user on disconnect
            for (let userId in users) {
                if (users[userId] === socket.id) {
                    delete users[userId];
                }
            }
        });
    });
};

// helper function (IMPORTANT)
module.exports.sendToUser = (io, userId, event, data) => {
    const socketId = users[userId];
    if (socketId) {
        io.to(socketId).emit(event, data);
    }
};