const socketService = require("./socket.Service");

exports.sendCustomMessage = (io) => (req, res) => {
  try {
    const { userId, message } = req.body;

    socketService.sendToUser(io, userId, "customMessage", {
      text: message,
    });

    return res.json({
      success: true,
      message: "Message sent via socket",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};