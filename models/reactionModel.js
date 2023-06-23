const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  type: {
    type: String,
    enum: ["like", "love", "haha"],
    required: true,
  },
});
// ^find => it mean if part of of teh word contains find
reactionSchema.pre(/^find/, function (next) {
  // this => query
  this.populate({
    path: "userId",
    select: "firstName ",
  });
  next();
});
const Reaction = mongoose.model("Reaction", reactionSchema);
module.exports = Reaction;
