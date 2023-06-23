const express = require("express");

const authServices = require("../services/authServices");
const {
  processConnectionRequestValidator,
  getConnectionRequestValidator,
  deleteConnectionRequestValidator
} = require("../utils/validators/connectionRequestValidator");
const {
  acceptFriendRequest,
  declineFriendRequest,
  getAllConnectionRequests,
  filterRequestsForLoggedUser,
  getConnectionRequest,
  deleteConnectionRequest,
} = require("../services/connectionRequestServices");

const router = express.Router();
router
  .route("/")
  .get(
    authServices.protect,
    authServices.allowedTo("user", "admin"),
    filterRequestsForLoggedUser,
    getAllConnectionRequests
  );
router
  .route("/:id")
  .get(
    authServices.protect,
    authServices.allowedTo("user", "admin"),
    getConnectionRequestValidator,
    getConnectionRequest
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("user"),
    deleteConnectionRequestValidator,
    deleteConnectionRequest
  );
//the request creator who can aceept or reject ,this implementation in the validator {processGroupRequestValidator}
router
  .route("/:id/accept")
  .put(
    authServices.protect,
    authServices.allowedTo("user"),
    processConnectionRequestValidator,
    acceptFriendRequest
  );
router
  .route("/:id/reject")
  .put(
    authServices.protect,
    authServices.allowedTo("user"),
    processConnectionRequestValidator,
    declineFriendRequest
  );

module.exports = router;
