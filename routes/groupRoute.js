const express = require("express");

const authServices = require("../services/authServices");
const groupValidator = require("../utils/validators/groupValidator");
const requestValidator = require("../utils/validators/requestValidator");
const groupServices = require("../services/groupServices");

const router = express.Router();

router
  .route("/myGroups")
  .get(
    authServices.protect,
    groupServices.filterGroupsForLoggedUser,
    groupServices.getMyGroups
  );
router
  .route("/")
  .get(authServices.protect, groupServices.getAll)
  .post(
    authServices.protect,
    authServices.allowedTo("user"),
    groupServices.setCreatorIdToBody,
    groupValidator.createGroupValidator,
    groupServices.create
  );
router
  .route("/:id")
  .get(
    authServices.protect,
    groupValidator.getGroupValidator,
    groupServices.getOne
  )
  .put(
    authServices.protect,
    groupValidator.actionGroupValidator,
    groupServices.updateGroup
  )
  .delete(
    authServices.protect,
    groupValidator.actionGroupValidator,
    groupServices.deleteGroup
  );
router
  .route("/:id/:action")
  .put(
    authServices.protect,
    requestValidator.actionToGroupRequestValidator,
    groupServices.actionGroupRequest
  );
router
  .route("/:id/requests")
  .get(
    authServices.protect,
    groupServices.filterGroupsRequestForLoggedUser,
    groupServices.getAllGroupRequests
  );
module.exports = router;
