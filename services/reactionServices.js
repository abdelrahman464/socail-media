const asyncHandler = require("express-async-handler");
const Reaction = require("../models/reactionModel");
const factory = require("./handllerFactory");

//@desc get all reacts on post
//@route GET /api/v1/reacts/post/:postId
//@access protected
exports.filterReactsOnPost = (req, res, next) => {
  const filterObject = { post: req.params.postId };
  req.filterObj = filterObject;
  next();
};
exports.getAllReacts = factory.getALl(Reaction, "Reaction", [
  { path: "user", select: "name profileImg" },
]);
//@desc toogle add react on post
//@route POST api/v1/reacts/post/:postId
//@access protected
exports.addReact = asyncHandler(async (req, res, next) => {
  const { type } = req.body;
  const { postId } = req.params;
  const userId = req.user._id;
  // Check if the user has already reacted to the post
  const existingReaction = await Reaction.findOne({
    post: postId,
    user: userId,
  });

  if (existingReaction) {
    // If the existing reaction is of the same type, remove it (toggle effect)
    if (existingReaction.type === type) {
      await Reaction.findByIdAndRemove(existingReaction._id);
      return res
        .status(200)
        .json({ message: "Reaction removed successfully." });
    }

    // If the existing reaction is of a different type, update it
    existingReaction.type = type;
    await existingReaction.save();
  } else {
    // Create and save a new reaction
    await new Reaction({ post: postId, user: userId, type }).save();
  }

  res.status(200).json({ success: true });
});
