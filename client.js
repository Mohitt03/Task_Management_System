const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  socket.emit("register", "123");
});

socket.on("customMessage", (data) => {
  console.log("📩 Received message:", data);
});

// 👇 ADD THIS (keep process alive)
process.stdin.resume();