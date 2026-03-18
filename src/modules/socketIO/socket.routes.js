const express = require("express");
const router = express.Router();

module.exports = (io) => {
  const controller = require("./socket.controller");

  router.post("/send", controller.sendCustomMessage(io));

  return router;
};