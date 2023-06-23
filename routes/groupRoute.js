const express = require("express");

const authServices = require("../services/authServices");
const { deleteGroupValidator } = require("../utils/validators/groupValidator");
const {
  createGroup,
  getGroup,
  getAllGroups,
  updateGroup,
  sendGroupRequest,
  deleteGroup,
  leaveGroup,
} = require("../services/groupServices");

const router = express.Router();

router
  .route("/")
  .get(
    authServices.protect,
    authServices.allowedTo( "admin"),
    getAllGroups
  )
  .post(authServices.protect, authServices.allowedTo("user"), createGroup);
router
  .route("/:id")
  .get(authServices.protect, authServices.allowedTo("user", "admin"), getGroup)
  .put(authServices.protect, authServices.allowedTo("admin"), updateGroup)
  .delete(
    authServices.protect,
    authServices.allowedTo("user", "admin"),
    deleteGroupValidator,
    deleteGroup
  );
router
  .route("/:id/request")
  .post(authServices.protect, authServices.allowedTo("user"), sendGroupRequest);
router
  .route("/:id/leave")
  .post(authServices.protect, authServices.allowedTo("user"), leaveGroup);
module.exports = router;
