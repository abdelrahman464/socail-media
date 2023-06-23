const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: ["like", "love", "haha"],
          required: true,
        },
      },
    ],
    sharedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    sharedTo: {
      type: String,
      enum: ["public", "group", "private"],
      default: "public",
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

// ^find => it mean if part of of teh word contains find
postSchema.pre(/^find/, function (next) {
  // this => query
  this.populate({
    path: "group",
    select: "name ",
  });
  this.populate({
    path: "sharedFrom",
    select: "user group -_id",
  });
  this.populate({
    path: "user",
    select: "firstName",
  });
  next();
});
const Post = mongoose.model("Post", postSchema);
module.exports = Post;
