const mongoose = require("mongoose");

const ConnectionRequestSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    removeAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  ConnectionRequestSchema
);
module.exports = ConnectionRequest;
