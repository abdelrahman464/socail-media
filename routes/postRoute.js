const express = require("express");
const postCommentRoute = require("./postCommentRoute");
const postReactRoute = require("./postReactRoute");

const authServices = require("../services/authServices");
const {
  createPost,
  sharePost,
  getALlPosts,
  getPost,
} = require("../services/postServices");

const router = express.Router();
router.use("/:postId/postComments", postCommentRoute);
router.use("/:postId/postReacts", postReactRoute);

router
  .route("/")
  .get(getALlPosts)
  .post(authServices.protect, authServices.allowedTo("user"), createPost);
router
  .route("/:id")
  .post(authServices.protect, authServices.allowedTo("user"), sharePost)
  .get(authServices.protect, authServices.allowedTo("user"), getPost);

module.exports = router;
