const Comment = require("../models/commentModel");
const factory = require("./handllerFactory");

//@desc create a new group
//@route POST /api/v1/comments/post/:postId
//@access protected user
exports.setPostAndUserToBody = (req, res, next) => {
  req.body.user = req.user._id;
  req.body.post = req.params.postId;
  next();
};
exports.createComment = factory.createOne(Comment);
//@desc get all comments
//@route GET /api/v1/comments/post/:postId
//@access protected user
exports.filterCommentOnPost = (req, res, next) => {
  const filterObject = { post: req.params.postId };
  req.filterObj = filterObject;
  next();
};
exports.getAllComment = factory.getALl(Comment, "Comment", [
  { path: "user", select: "firstName profileImg" },
]);
//@desc get comment
//@route GET /api/v1/comments/:id
//@access protected user
exports.getComment = factory.getOne(Comment, [
  { path: "user", select: "firstName profileImg" },
  { path: "post", select: "content group" },
]);
//@desc update comment
//@route POST /api/v1/comments/:id
//@access protected admin,user that created the comment
exports.updateComment = factory.updateOne(Comment);
//@desc delete comment
//@route POST /api/v1/comments/:id
//@access protected  admin,user that created the comment
exports.deleteComment = factory.deleteOne(Comment);
