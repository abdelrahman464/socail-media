const express = require("express");
const { idValidator } = require("../utils/validators/idValidator");
const {
  updateCommentValidator,
  deleteCommentValidator,
} = require("../utils/validators/commentValidator");
const authServices = require("../services/authServices");

const {
  setPostAndUserToBody,
  createComment,
  getComment,
  getAllComment,
  deleteComment,
  updateComment,
  filterCommentOnPost,
} = require("../services/commentService");

const router = express.Router();
router
  .route("/post/:postId")
  .post(
    authServices.protect,
    idValidator("postId"),
    setPostAndUserToBody,
    createComment
  )
  .get(
    authServices.protect,
    idValidator("postId"),
    filterCommentOnPost,
    getAllComment
  );
router
  .route("/:id")
  .get(authServices.protect, idValidator("id"), getComment)
  .put(
    authServices.protect,
    authServices.allowedTo("user"),
    updateCommentValidator,
    updateComment
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("user", "admin"),
    idValidator("id"),
    deleteCommentValidator,
    deleteComment
  );

module.exports = router;
