const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Group = require("../models/groupModel");
const GroupRequest = require("../models/groupRequestModel");
const factory = require("./handllerFactory");

//@desc accept request
//@route PUT api/v1/groupRequests/:id/accept
//@access protected admin
exports.acceptGroupRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //requestId
  //1- check request exists or not
  const groupRequest = await GroupRequest.findById(id);
  if (!groupRequest) {
    return next(new ApiError(`Group request not found`, 404));
  }
  //2- ckeck group request status ,is it replay before or not
  if (groupRequest.status !== "pending") {
    return next(new ApiError(`Group request is already processed`, 400));
  }

  //3- Update the status of the group request
  groupRequest.status = "accepted";
  groupRequest.joinedAt = new Date();
  await groupRequest.save();

  //4- Add the user to the group members
  const group = await Group.findById(groupRequest.group._id);
  group.members.push({
    userId: groupRequest.user._id,
    joinedAt: groupRequest.joinedAt,
  });
  await group.save();

  res.status(200).json({ success: true, groupRequest });
});
//@desc reject request
//@route PUT api/v1/groupRequests/:id/reject
//@access protected admin
exports.rejectGroupRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //requestId
  //1- check request exists or not
  const groupRequest = await GroupRequest.findById(id);
  if (!groupRequest) {
    return next(new ApiError(`Group request not found`, 404));
  }
  //2- ckeck group request status ,is it replay before or not
  if (groupRequest.status !== "pending") {
    return next(new ApiError(`Group request is already processed`, 400));
  }
  //3- Update the status of the group request
  groupRequest.status = "rejected";
  await groupRequest.save();

  res.status(200).json({ success: true, groupRequest });
});
exports.filterRequestsForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});
//@desc get all requests
//@route GET api/v1/groupRequests
//@access protected admin
exports.getAllGroupRequests = factory.getALl(GroupRequest);
//@desc get  request
//@route GET api/v1/groupRequests/:id
//@access protected admin ,user that made the request
exports.getGroupRequest = factory.getOne(GroupRequest);
//@desc delete request
//@route GET api/v1/groupRequests/:id
//@access protected user that made the request
exports.deleteGroupRequest = factory.deleteOne(GroupRequest);
