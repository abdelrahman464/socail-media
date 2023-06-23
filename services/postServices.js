const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const factory = require("./handllerFactory");

//@desc create post
//@route POST api/v1/posts
//@access protected user
exports.createPost = asyncHandler(async (req, res, next) => {
  const { content, groupId } = req.body;
  const userId = req.user._id;

  // Create a new post
  const post = new Post({
    user: userId,
    content,
    group: groupId,
  });

  //check user exists and push the post id in user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError(`User not found`, 404));
  }
  user.posts.push(post._id);
  await user.save();

  //check group exists and push the post id in group
  if (groupId) {
    const group = await Group.findById(groupId);
    if (!group) {
      return next(new ApiError(`Group not found`, 404));
    }
    // only the creator of the group and the memeber who can post in this group
    if (
      !group.members.includes(userId) &&
      group.createdBy._id.toString() !== userId.toString()
    ) {
      return next(new ApiError(`You Are Not A Member Of This Group`, 404));
    }
    group.posts.push(post._id);
    await group.save();
    post.sharedTo = "group";
  }
  await post.save();
  res.status(201).json({ success: true, post });
});
//@desc create post
//@route POST api/v1/posts/:postid
//@access protected user
exports.sharePost = asyncHandler(async (req, res, next) => {
  const { groupId, sharedTo } = req.body;
  const { id } = req.params; //postId
  const userId = req.user._id;

  //check if post exists
  const post = await Post.findById(id);
  if (!post) {
    return next(new ApiError(`Post not found`, 404));
  }
  //sharing the post
  const sharedPost = new Post({
    user: userId,
    content: post.content,
    sharedFrom: id,
    sharedTo,
  });
  //check if group exists and push the shared post id to the group
  if (groupId) {
    const group = await Group.findById(groupId);
    if (!group) {
      return next(new ApiError(`Group not found`, 404));
    }
    // group.posts.push(sharedPost._id);
    // await group.save();
    // post.sharedTo = "group";
    group.posts.push(sharedPost._id);
    await group.save();
    sharedPost.sharedTo = "group";
    sharedPost.group = group._id;
  }
  //check if user exists and push the shared post id to the user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError(`User not found`, 404));
  }
  user.posts.push(sharedPost._id);
  await user.save();

  await sharedPost.save();
  res.status(201).json({ success: true, sharedPost });
});
//@desc get all posts post
//@route GET api/v1/posts
//@access protected user,admin
exports.getALlPosts = factory.getALl(Post);
//@desc get post
//@route GET api/v1/posts/:id
//@access protected user
exports.getPost = factory.getOne(Post);
