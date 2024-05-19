const express = require("express");
const { idValidator } = require("../utils/validators/idValidator");
const authServices = require("../services/authServices");
const {
  addReact,
  filterReactsOnPost,
  getAllReacts,
} = require("../services/reactionServices");

const router = express.Router();
router
  .route("/post/:postId")
  .get(
    authServices.protect,
    idValidator("postId"),
    filterReactsOnPost,
    getAllReacts
  )
  .post(authServices.protect, idValidator("postId"), addReact);

module.exports = router;
