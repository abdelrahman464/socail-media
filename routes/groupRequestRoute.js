const express = require("express");

const authServices = require("../services/authServices");
const {
  processGroupRequestValidator,
  getGroupRequestValidator,
} = require("../utils/validators/groupRequestValidator");
const {
  acceptGroupRequest,
  rejectGroupRequest,
  getGroupRequest,
  filterRequestsForLoggedUser,
  getAllGroupRequests,
  deleteGroupRequest,
} = require("../services/groupRequestServices");

const router = express.Router();
router
  .route("/")
  .get(
    authServices.protect,
    authServices.allowedTo("user", "admin"),
    filterRequestsForLoggedUser,
    getAllGroupRequests
  );
router
  .route("/:id")
  .get(
    authServices.protect,
    authServices.allowedTo("user", "admin"),
    getGroupRequestValidator,
    getGroupRequest
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("user"),
    getGroupRequestValidator,
    deleteGroupRequest
  );
//the group creator who can aceept or reject ,this implementation in the validator {processGroupRequestValidator}
router
  .route("/:id/accept")
  .put(
    authServices.protect,
    authServices.allowedTo("user"),
    processGroupRequestValidator,
    acceptGroupRequest
  );
router
  .route("/:id/reject")
  .put(
    authServices.protect,
    authServices.allowedTo("user"),
    processGroupRequestValidator,
    rejectGroupRequest
  );

module.exports = router;
