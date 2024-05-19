const asyncHandler = require("express-async-handler");
const ApiError = require("../apiError");
const Request = require("../../models/requestModel");
const Group = require("../../models/groupModel");
const User = require("../../models/userModel");

//@route POST api/v1/connections/:id/connectFriend
exports.connectFriendValidator = asyncHandler(async (req, res, next) => {
  const friendId = req.params.id; //friendId
  const userId = req.user._id;

  const friend = await User.findById(friendId);
  if (!friend) {
    return next(new ApiError(`User not found `, 404));
  }
  // Check for existing requests in either direction between the same users
  const existingRequest = await Request.findOne({
    $or: [
      { user: userId, toUser: friendId },
      { user: friendId, toUser: userId },
    ],
    type: "connect",
  });

  if (existingRequest) {
    return next(
      new ApiError(
        `You Have Already Sent A Request or User Has Sent A Reqeust To You`,
        400
      )
    );
  }
  next();
});

//@route Delete api/v1/connections/:id/removeFriend
exports.removeFriendValidator = asyncHandler(async (req, res, next) => {
  const friendId = req.params.id; //friendId
  const userId = req.user._id;

  const friend = await User.findById(friendId);
  if (!friend) {
    return next(new ApiError(`User not found`, 404));
  }
  //check if the user is already a friend
  const existingRequest = await Request.findOne({
    $or: [
      { user: userId, toUser: friendId },
      { user: friendId, toUser: userId },
    ],
    type: "connect",
    status: "accepted",
  });
  if (!existingRequest) {
    return next(
      new ApiError(
        `He is not your friend or you have not accepted his request yet`,
        400
      )
    );
  }
  req.existingRequestId = existingRequest._id;
  next();
});

//@route PUT  api/v1/connections/:id/:action
exports.actionToFriendconnectValidator = asyncHandler(
  async (req, res, next) => {
    const requestId = req.params.id; //requestId
    const userCanDo = req.user._id;
    //1- check request exists or not
    const connectionRequest = await Request.findOne({
      _id: requestId,
      toUser: userCanDo,
      type: "connect",
      status: "pending",
    });

    if (!connectionRequest) {
      return next(new ApiError(`Request Not Found or Already Processed`, 404));
    }
    req.connectionRequest = connectionRequest;
    next();
  }
);

//@route POST /api/v1/groups/:groupId/request
exports.sendGroupRequestValidator = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params.id;
  const userId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ApiError(`Group not found `, 404));
  }
  //check if the group creator who sent the request
  if (group.createdBy._id.toString() === userId.toString()) {
    return next(
      new ApiError(`group creator cann't send request to his group `, 400)
    );
  }
  // Check for existing requests
  const existingRequest = await Request.findOne({
    group: groupId,
    user: userId,
    type: "group",
  });
  if (existingRequest) {
    return next(new ApiError(`You Have Already Sent A Request`, 400));
  }

  next();
});

exports.leaveGroupValidator = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params.id;
  const userId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ApiError(`Group not found `, 404));
  }
  //check if the user is the creator of the group
  if (group.createdBy._id.toString() === userId.toString()) {
    return next(
      new ApiError(
        `You Are A Creator Of The Group,Can't Leave ,
        But You can delete The Group or let someone else to be the creator`,
        400
      )
    );
  }
  //check if the user is already a member of the group
  const existingRequest = await Request.findOne({
    user: userId,
    group: groupId,
    type: "group",
    status: "accepted",
  });

  if (!existingRequest) {
    return next(new ApiError("You Are Not A Member Of This Group", 400));
  }
  next();
});

//@route PUT api/v1/groups/:id/:action
exports.actionToGroupRequestValidator = asyncHandler(async (req, res, next) => {
  const requestId = req.params.id;

  //1- check request exists or not
  const groupRequest = await Request.findOne({
    _id: requestId,
    type: "group",
    status: "pending",
  });

  if (!groupRequest) {
    return next(new ApiError(`Request Not Found or Already Processed`, 404));
  }
  req.groupRequest = groupRequest;
  next();
});
