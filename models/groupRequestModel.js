const mongoose = require("mongoose");

const groupRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "request must belong to user"],
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    leftAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ^find => it mean if part of of teh word contains find
groupRequestSchema.pre(/^find/, function (next) {
  // this => query
  this.populate({
    path: "user",
    select: "firstName",
  });
  this.populate({
    path: "group",
    select: "name",
  });
  next();
});
const GroupRequest = mongoose.model("GroupRequest", groupRequestSchema);
module.exports = GroupRequest;
