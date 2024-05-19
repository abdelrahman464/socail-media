const expressAsyncHandler = require("express-async-handler");
const Post = require("../../models/postModel");
const ApiError = require("../apiError");

exports.addReact = expressAsyncHandler(async (req, res, next) => {
  const {type} = req.body;
  const {postId} = req.params;
   //type must be like, love, haha, wow, sad, angry
   if (type && !["like", "love", "haha", "wow", "sad", "angry"].includes(type)) {
    return next(
      new ApiError(`type must be like, love, haha, wow, sad, angry`, 400)
    );
  }
  //check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ApiError(`Post not found`, 404));
  }
  next();
})
