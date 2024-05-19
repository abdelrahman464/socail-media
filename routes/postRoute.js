const express = require("express");

const { idValidator } = require("../utils/validators/idValidator");
const postValidator = require("../utils/validators/postValidator");
const authServices = require("../services/authServices");
const postServices = require("../services/postServices");

const router = express.Router();

router
  .route("/")
  .get(postServices.getALlPosts)
  .post(
    authServices.protect,
    postServices.setuserIdToBody,
    postValidator.createPostValidator,
    postServices.createPost
  );
router
  .route("/:id/share/:groupId?")
  .post(
    authServices.protect,
    authServices.allowedTo("user"),
    idValidator("id"),
    postValidator.sharePostValidator,
    postServices.sharePost
  );
router
  .route("/:id")
  .get(
    authServices.protect,
    authServices.allowedTo("user"),
    idValidator("id"),
    postServices.getPost
  );
router
  .route("/userPosts/:userId")
  .get(
    authServices.protect,
    idValidator("userId"),
    postServices.filtertoGetUserPostsForLoggedUser,
    postServices.getALlPosts
  );

module.exports = router;
