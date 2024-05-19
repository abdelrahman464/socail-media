const express = require("express");
const { idValidator } = require("../utils/validators/idValidator");
const requestValidator = require("../utils/validators/requestValidator");
const authServices = require("../services/authServices");
const connecttionServices = require("../services/connectionService");

const router = express.Router();
router
  .route("/")
  .get(
    authServices.protect,
    connecttionServices.filterconnectorsForLoggedUser,
    connecttionServices.getMyConnectors
  );
router
  .route("/requests/:type")//sent or recive
  .get(
    authServices.protect,
    connecttionServices.filterRequestsForLoggedUser,
    connecttionServices.getAllRequests
  );
router
  .route("/:id/connectFriend")
  .post(
    authServices.protect,
    idValidator("id"),
    requestValidator.connectFriendValidator,
    connecttionServices.connectFriend
  )
  .delete(
    authServices.protect,
    idValidator("id"),
    requestValidator.removeFriendValidator,
    connecttionServices.removeFriend
  );

router
  .route("/:id/:action")
  .put(
    authServices.protect,
    idValidator("id"),
    requestValidator.actionToFriendconnectValidator,
    connecttionServices.actionFriendconnect
  );

module.exports = router;
