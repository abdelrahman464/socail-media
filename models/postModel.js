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
      validate: {
        validator: function (value) {
          return this.sharedTo === "group" ? value != null : true;
        },
        message: "group is required when sharedTo is 'group'",
      },
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
