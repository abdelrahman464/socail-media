const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Post = require("../models/postModel");
const Group = require("../models/groupModel");
const User = require("../models/userModel");
const Comment = require("../models/commentModel");
const factory = require("./handllerFactory");

//filter comments in specefic post by post id
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.postId) filterObject = { post: req.params.postId };
  req.filterObj = filterObject;
  next();
};
//@desc create a new group
//@route POST /api/v1/postComments
//@access protected user
exports.createComment = asyncHandler(async (req, res, next) => {
  const { content, postId } = req.body;
  const userId = req.user._id;
  //check if post exist
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ApiError(`Post not found`, 404));
  }
  //check if user exist
  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError(`User not found`, 404));
  }
  //check group exists and this user is member of this group
  if (post.group) {
    const postGroup = await Group.findById(post.group._id);
    if (!postGroup) {
      return next(new ApiError(`Group not found`, 404));
    }
    const userExists = postGroup.members.some(
      (obj) => obj.userId.toString() === userId
    );

    if (userExists) {
      return next(new ApiError(`You Are Not A Member Of This Group`, 404));
    }
  }
  //create commnet
  const comment = new Comment({
    user: userId,
    content,
    post: postId,
  });
  //push the comment id to post
  post.comments.push(comment._id);
  await post.save();

  await comment.save();
  res.status(201).json({ success: true, comment });
});
//@desc get all comments
//@route GET /api/v1/postComments
//@access protected user
exports.getAllComment = factory.getALl(Comment);
//@desc get comment
//@route GET /api/v1/postComments/:commentId
//@access protected user
exports.getComment = factory.getOne(Comment, "user");
//@desc update comment
//@route POST /api/v1/postComments/:commentId
//@access protected user that created the comment
exports.updateComment = factory.updateOne(Comment);
//@desc delete comment
//@route POST /api/v1/postComments/:commentId
//@access protected user that created the comment
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //commentId
  //check if comment exists
  const comment = await Comment.findById(id);
  if (!comment) {
    return next(new ApiError(`Comment not found`, 404));
  }
  //check if post exists
  const post = await Post.findById(comment.post);
  if (!post) {
    return next(new ApiError(`Post not found`, 404));
  }
  //remove the comment from the post
  post.comments = post.comments.filter((c) => c.toString() !== id);
  await post.save();

  await Comment.findByIdAndDelete(id);

  res.status(200).json({ success: true });
});
