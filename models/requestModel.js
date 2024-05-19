const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "request must belong to user"],
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (value) {
          return this.type === "connect" ? value != null : true;
        },
        message: "toUser is required when type is 'connect'",
      },
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      validate: {
        validator: function (value) {
          return this.type === "group" ? value != null : true;
        },
        message: "group is required when type is 'group'",
      },
    },
    type: {
      type: String,
      enum: ["connect", "group"],
      required: [true, "request must have a type"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    acceptedAt: {
      type: Date,
      default: undefined,
    },
    rejectedAt: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
