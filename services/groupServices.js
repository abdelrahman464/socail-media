const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Group = require("../models/groupModel");
const GroupRequest = require("../models/groupRequestModel");
const User = require("../models/userModel");
const factory = require("./handllerFactory");

//@desc create a new group
//@route POST /api/v1/groups
//@access protected user
exports.createGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const createdBy = req.user._id;
  const group = await Group.create({ name, createdBy });

  // Add the group to the user's groups
  await User.findByIdAndUpdate(createdBy, { $push: { groups: group._id } });

  res.status(201).json({ success: true, group });
});
//@desc get group
//@route GET /api/v1/groups/:groupId
//@access protected user ,admin
exports.getGroup = factory.getOne(Group, "members");
//@desc get all groups
//@route GET /api/v1/groups
//@access protected admin
exports.getAllGroups = factory.getALl(Group);
//@desc get all groups
//@route PUT /api/v1/groups/:id
//@access protected admin
exports.updateGroup = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //groupId
  const group = await Group.findByIdAndUpdate(
    id,
    { name: req.body.name },
    { new: true }
  );
  if (!group) {
    return next(new ApiError(`Group not found`, 404));
  }
  res.status(200).json({ group });
});
//@desc send request to group
//@route POST /api/v1/groups/:groupId/request
//@access protected user
exports.sendGroupRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //groupId
  const userId = req.user._id;
  //1- check if the group exists
  const group = await Group.findById(id);
  if (!group) {
    return next(new ApiError(`Group not found `, 404));
  }
  //2-check if the group creator who sent the request
  if (group.createdBy._id.toString() === userId.toString()) {
    return next(
      new ApiError(`group creator cann't send request to his group `, 400)
    );
  }
  //3- check if the request sent before
  const existingRequest = await GroupRequest.findOne({
    group: id,
    user: userId,
  });
  if (existingRequest) {
    return next(new ApiError(`Request already sent`, 400));
  }
  //4- send the request
  const groupRequest = await GroupRequest.create({
    group: id,
    user: userId,
  });
  //5- Add the group request to the user's groupRequests
  await User.findByIdAndUpdate(userId, {
    $push: { groupRequests: groupRequest._id },
  });

  res.status(201).json({ success: true, groupRequest });
});
//@desc leave group
//@route POST /api/v1/groups/:groupId/leave
//@access protected user
exports.leaveGroup = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //groupId
  const userId = req.user._id;
  //1- get the request that user made it to join this group
  const groupRequest = await GroupRequest.findOne({
    group: id,
    user: userId,
    status: "accepted",
  });

  const currentGroup = await Group.findById(id);
  if (currentGroup.createdBy._id.toString() === userId.toString()) {
    return next(
      new ApiError(
        `You Are A Creator Of The Group,Can't Leave ,But You can delete The Group`,
        400
      )
    );
  }
  if (!groupRequest) {
    return next(new ApiError(`User is not a member of the group`, 404));
  }
  //2- check if user left the group before
  if (groupRequest.leftAt) {
    return next(new ApiError(`User has already left the group`, 400));
  }
  //3- set the current date as the date user left in from the group
  groupRequest.leftAt = new Date();
  await groupRequest.save();

  //4- Remove user from the group members
  const group = await Group.findById(id);
  group.members = group.members.filter(
    (member) => member.userId.toString() !== userId.toString()
  );
  await group.save();

  res.status(200).json({ success: true });
});
//@desc delete  group
//@route DELETE /api/v1/groups
//@access protected admin
exports.deleteGroup = factory.deleteOne(Group);
