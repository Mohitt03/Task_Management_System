let users = {}; // userId -> socketId

exports.registerUser = (userId, socketId) => {
  users[userId] = socketId;
  console.log("👤 Users:", users);
};

exports.removeUser = (socketId) => {
  for (let userId in users) {
    if (users[userId] === socketId) {
      delete users[userId];
    }
  }
};

exports.sendToUser = (io, userId, event, data) => {
  const socketId = users[userId];

  console.log("📤 Sending to:", userId, socketId); // 👈 IMPORTANT

  if (socketId) {
    io.to(socketId).emit(event, data);
  } else {
    console.log("❌ User not found");
  }
};