const express = require("express");

const authServices = require("../services/authServices");
const {
  connectFriends,
  endFriendship,
} = require("../services/connecttionServices");

const router = express.Router();
router
  .route("/:id/connect")
  .post(authServices.protect, authServices.allowedTo("user"), connectFriends);
router
  .route("/:id/remove")
  .delete(authServices.protect, authServices.allowedTo("user"), endFriendship);

module.exports = router;
