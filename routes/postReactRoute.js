const express = require("express");

const authServices = require("../services/authServices");
const {
  addReact,
  createFilterObj,
  getAllReactions,
} = require("../services/reactOnPostServices");

const router = express.Router({ mergeParams: true });
router
  .route("/")
  .get(
    authServices.protect,
    authServices.allowedTo("user"),
    createFilterObj,
    getAllReactions
  )
  .post(authServices.protect, authServices.allowedTo("user"), addReact);

module.exports = router;
