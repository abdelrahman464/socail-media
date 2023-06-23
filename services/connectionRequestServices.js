const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const ConnectionRequest = require("../models/connectionRequestModel");
const factory = require("./handllerFactory");

//@desc accept request
//@route PUT
//@access protected admin
exports.acceptFriendRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //requestId
  //1- check request exists or not
  const connectionRequest = await ConnectionRequest.findById(id);
  if (!connectionRequest) {
    return next(new ApiError(`connection request not found`, 404));
  }
  //2- ckeck group request status ,is it replay before or not
  if (connectionRequest.status !== "pending") {
    return next(new ApiError(`connection request is already processed`, 400));
  }

  //3- Update the status of the group request
  connectionRequest.status = "accepted";
  connectionRequest.acceptedAt = new Date();
  await connectionRequest.save();

  //4- Add the friendId to the user's connections array
  const user = await User.findById(connectionRequest.toUser._id);
  user.connections.push(connectionRequest.fromUser._id);
  await user.save();

  const friendUser = await User.findById(connectionRequest.fromUser._id);
  friendUser.connections.push(connectionRequest.toUser._id);
  await friendUser.save();

  res.status(200).json({ success: true, connectionRequest });
});
//@desc reject request
//@route PUT
//@access protected admin
exports.declineFriendRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //requestId
  //1- check request exists or not
  const connectionRequest = await ConnectionRequest.findById(id);
  if (!connectionRequest) {
    return next(new ApiError(`connection request not found`, 404));
  }
  //2- ckeck connection request status ,is it replay before or not
  if (connectionRequest.status !== "pending") {
    return next(new ApiError(`connection request is already processed`, 400));
  }
  //3- Update the status of the connection request
  connectionRequest.status = "rejected";
  await connectionRequest.save();

  res.status(200).json({ success: true, connectionRequest });
});
exports.filterRequestsForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user")
    req.filterObj = {
      $and: [
        {
          $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
        },
        { status: "pending" },
      ],
    };

  next();
});
//@desc get all requests
//@route GET api/v1/groupRequests
//@access protected admin
exports.getAllConnectionRequests = factory.getALl(ConnectionRequest);
//@desc get  request
//@route GET api/v1/groupRequests/:id
//@access protected admin ,user that made the request
exports.getConnectionRequest = factory.getOne(ConnectionRequest);
//@desc delete request
//@route GET api/v1/groupRequests/:id
//@access protected user that made the request
exports.deleteConnectionRequest = factory.deleteOne(ConnectionRequest);
