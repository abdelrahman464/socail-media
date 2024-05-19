const asyncHandler = require("express-async-handler");
const ApiError = require("../apiError");
const Request = require("../../models/requestModel");
const Group = require("../../models/groupModel");
const Post = require("../../models/postModel");

//@route POST api/v1/posts
exports.createPostValidator = asyncHandler(async (req, res, next) => {
  //if the post is shared to group, then group id is required
  const {group, sharedTo } = req.body;

  //sharedTo must be public or group or private
  if (sharedTo && !["public", "group", "private"].includes(sharedTo)) {
    return next(
      new ApiError(`sharedTo must be public or group or private`, 400)
    );
  }

  if (sharedTo === "group" && !group) {
    return next(
      new ApiError("group is required when sharedTo is 'group'", 400)
    );
  }
  //check if group is exists
  if (sharedTo === "group" && group) {
    const groupExists = await Group.findById(group);
    if (!groupExists) {
      return next(new ApiError("Group not found", 404));
    }
    //if group is private check if user is a memeber of this group
    if (groupExists.type === "private") {
      const userRequest = await Request.findOne({
        user: req.user._id,
        group: groupExists._id,
        type: "group",
        status: "accepted",
      });
      if (!userRequest) {
        return next(new ApiError("You are not a member of this group", 401));
      }
    }
  }

  next();
});

exports.sharePostValidator = asyncHandler(async (req, res, next) => {
  const { sharedTo } = req.body;
  const { groupId } = req.params;
  const postId = req.params.id;
  //sharedTo must be public or group or private
  if (sharedTo && !["public", "group", "private"].includes(sharedTo)) {
    return next(
      new ApiError(`sharedTo must be public or group or private`, 400)
    );
  }

  if (sharedTo === "group" && !groupId) {
    return next(
      new ApiError("group is required when sharedTo is 'group'", 400)
    );
  }
  if (sharedTo === "group") {
    //check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ApiError(`Post not found`, 404));
    }
    //check if group exists
    const groupExists = await Group.findById(groupId);
    if (!groupExists) {
      return next(new ApiError("Group not found", 404));
    }

    if (groupExists.type === "private") {
      const userRequest = await Request.findOne({
        user: req.user._id,
        group: groupExists._id,
        type: "group",
        status: "accepted",
      });
      if (!userRequest) {
        return next(new ApiError("You are not a member of this group", 401));
      }
    }
  }

  next();
});
