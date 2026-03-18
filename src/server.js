// require("dotenv").config();
// const app = require("./app");
// const connect = require('./config/db')

// const Port = process.env.PORT || 3000
// connect()


// const expireCompanyPlan = require("./cron/expireCompanyPlan");

// expireCompanyPlan();

// app.listen(Port, () => console.log(`Server is running on port ${Port}`))

require("dotenv").config();
const app = require("./app");
const connect = require("./config/db");

const http = require("http");
const { Server } = require("socket.io");

const Port = process.env.PORT || 3000;

connect();

// ✅ create HTTP server
const server = http.createServer(app);

// ✅ attach socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
// ✅ socket logic
const socketService = require("./modules/socketIO/socket.Service");

io.on("connection", (socket) => {
    console.log("🔥 User connected:", socket.id);

    socket.on("register", (userId) => {
        socketService.registerUser(userId, socket.id);
        console.log("User registered:", userId);
    });

    socket.on("disconnect", () => {
        socketService.removeUser(socket.id);
        console.log("User disconnected");
    });
});

// ✅ routes (IMPORTANT)
const socketRoutes = require("./modules/socketIO/socket.routes");
app.use("/api/socket", socketRoutes(io));

// cron (keep this)
const expireCompanyPlan = require("./cron/expireCompanyPlan");
expireCompanyPlan();

// ❗ IMPORTANT: use server.listen
server.listen(Port, () =>
    console.log(`🚀 Server is running on port ${Port}`)
);