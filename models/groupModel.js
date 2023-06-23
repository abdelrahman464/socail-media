const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

// ^find => it mean if part of of teh word contains find
groupSchema.pre(/^find/, function (next) {
  // this => query
  this.populate({
    path: "createdBy",
    select: "firstName ",
  });
  next();
});

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
