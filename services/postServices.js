const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Post = require("../models/postModel");
const Request = require("../models/requestModel");
const factory = require("./handllerFactory");
const User = require("../models/userModel");

//@desc create post
//@route POST api/v1/posts
//@access protected user
exports.setuserIdToBody = (req, res, next) => {
  req.body.user = req.user._id;
  next();
};
exports.createPost = factory.createOne(Post);
//@desc create post
//@route POST api/v1/posts/:id/share/:groupId
//@access protected user
exports.sharePost = asyncHandler(async (req, res, next) => {
  const { sharedTo, content } = req.body;
  const postId = req.params.id;
  const { groupId } = req.params;
  const userId = req.user._id;

  //sharing the post
  const sharedPost = await Post.create({
    user: userId,
    content: content,
    sharedFrom: postId,
    group: groupId || null,
    sharedTo,
  });

  res.status(201).json({ success: true, sharedPost });
});
//@desc get all posts post
//@route GET api/v1/posts
//@access protected user,admin
exports.getALlPosts = factory.getALl(Post, "Post", [
  { path: "user", select: "firstName profileImg" },
  { path: "group", select: "name" },
  { path: "sharedFrom", select: "user group content" },
]);
//@desc get post
//@route GET api/v1/posts/:id
//@access protected user
exports.getPost = factory.getOne(Post);
//@desc get user posts
//@route GET api/v1/posts/userPosts/:userId
//@access protected user
exports.filtertoGetUserPostsForLoggedUser = asyncHandler(
  async (req, res, next) => {
    const { userId } = req.params;
    const filterObject = { user: userId }; // Default to allow viewing own posts.

    const profileUser = await User.findById(userId);
    if (profileUser.lockedProfile) {
      // Only add extra checks if the profile is locked
      const userConnectors = await Request.find(
        {
          $or: [
            { user: userId, toUser: req.user._id },
            { user: req.user._id, toUser: userId },
          ],
          type: "connect",
          status: "accepted",
        },
        "user toUser"
      ); // Only retrieve the user and toUser fields for efficiency

      const userConnectorsIds = userConnectors.flatMap((connector) => [
        connector.user.toString(),
        connector.toUser.toString(),
      ]);
      //check if logged user is connected to the profile user or this is logged user profile
      const isUserConnectedOrSelf =
        userConnectorsIds.includes(req.user._id.toString()) ||
        userId === req.user._id.toString();

      if (!isUserConnectedOrSelf) {
        return next(
          new ApiError(
            `Access to this profile's posts is restricted, ${profileUser.firstName}'s Profile is Locked`,
            403
          )
        );
      }
    }
    req.filterObj = filterObject;
    next();
  }
);
