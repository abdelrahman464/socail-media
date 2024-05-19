const asyncHandler = require("express-async-handler");
const Request = require("../models/requestModel");
const factory = require("./handllerFactory");
const ApiError = require("../utils/apiError");
//@desc connect friend
//@route POST api/v1/connections/:id/connectFriend
//@access protected user
exports.connectFriend = asyncHandler(async (req, res, next) => {
  const friendId = req.params.id; //friendId
  const userId = req.user._id;
  const newRequest = await Request.create({
    user: userId,
    toUser: friendId,
    type: "connect", // This type is specific to friend requests
  });
  res.status(201).json({ success: true, newRequest });
});
//@desc remove friend
//@route Delete api/v1/connections/:id/connectFriend
//@access protected user
exports.removeFriend = asyncHandler(async (req, res, next) => {
  const requestId = req.existingRequestId;
  await Request.deleteOne({ _id: requestId });
  res.status(200).json({ success: true });
});

//@desc accept connection friend request
//@route PUT  api/v1/connections/:id/:action
//@access protected
exports.actionFriendconnect = asyncHandler(async (req, res, next) => {
  const { connectionRequest } = req;
  const { action } = req.params;
  //action must be accept or reject
  if (action && !["accept", "reject"].includes(action)) {
    return next(new ApiError(`Type must be accept or reject`, 400));
  }
  if (action === "accept") {
    connectionRequest.status = "accepted";
    connectionRequest.acceptedAt = Date.now();
  } else {
    connectionRequest.status = "rejected";
    connectionRequest.rejectedAt = Date.now();
  }

  await connectionRequest.save();
  res.status(200).json({ success: true, connectionRequest });
});

//@desc get all requests
//@route GET api/v1/connections/requests
//@access protected
exports.filterRequestsForLoggedUser = (req, res, next) => {
  const { type } = req.params;
  let requestFilter = {};
  if (type === "recive") {
    requestFilter = {
      type: "connect",
      status: "pending",
      toUser: req.user._id,
    };
  } else if (type === "sent") {
    requestFilter = {
      type: "connect",
      status: "pending",
      user: req.user._id,
    };
  }

  let filterObject = {};
  if (req.user.role === "admin") {
    filterObject = { type: "connect", status: "pending" };
  } else {
    filterObject = requestFilter;
  }
  req.filterObj = filterObject;
  next();
};

exports.getAllRequests = factory.getALl(Request, "Request", [
  { path: "user", select: "firstName profileImg" },
  { path: "toUser", select: "firstName profileImg" },
]);
//@desc get MY Connectors
//@route GET api/v1/connections
//@access protected
exports.filterconnectorsForLoggedUser = (req, res, next) => {
  const userId = req.user._id;
  const filterObject = {
    $or: [{ user: userId }, { toUser: userId }],
    type: "connect",
    status: "accepted",
  };

  req.filterObj = filterObject;
  next();
};
exports.getMyConnectors = factory.getALl(Request, "Request", [
  { path: "user", select: "firstName profileImg" },
  { path: "toUser", select: "firstName profileImg" },
]);
