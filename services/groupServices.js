const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Group = require("../models/groupModel");
const Request = require("../models/requestModel");
const factory = require("./handllerFactory");

//@desc create a new group
//@route POST /api/v1/groups
//@access protected user
exports.setCreatorIdToBody = (req, res, next) => {
  req.body.createdBy = req.user._id;
  next();
};
exports.create = factory.createOne(Group);
//@desc get group
//@route GET /api/v1/groups/:id
//@access protected
exports.getOne = factory.getOne(Group);
//@desc get all groups
//@route GET /api/v1/groups/myGroups
//@access protected
exports.filterGroupsForLoggedUser = (req, res, next) => {
  const filterObject = { createdBy: req.user._id };
  req.filterObj = filterObject;
  next();
};
exports.getMyGroups = factory.getALl(Group, "Group", [
  { path: "createdBy", select: "firstName profileImg" },
]);
//@desc get all groups
//@route GET /api/v1/groups
//@access protected
exports.getAll = factory.getALl(Group, "Group", [
  { path: "createdBy", select: "firstName profileImg" },
]);

//@desc delete  group
//@route DELETE /api/v1/groups/:id
//@access protected admin
exports.deleteGroup = factory.deleteOne(Group);
//@desc get all groups
//@route PUT /api/v1/groups/:id
//@access protected admin
exports.updateGroup = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //groupId
  const { name, description, type } = req.body;

  //type must be public or private
  if (type && !["public", "private"].includes(type)) {
    return next(new ApiError(`Type must be public or private`, 400));
  }
  const group = await Group.findByIdAndUpdate(
    id,
    { name, description, type },
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
  const { groupId } = req.params.id; //groupId
  const userId = req.user._id;

  //4- send the request
  const groupRequest = await Request.create({
    group: groupId,
    user: userId,
    type: "group",
  });

  res.status(201).json({ success: true, groupRequest });
});
//@desc leave group
//@route POST /api/v1/groups/:groupId/leave
//@access protected user
exports.leaveGroup = asyncHandler(async (req, res, next) => {
  const groupId = req.params.id; //groupId
  const userId = req.user._id;

  await Request.findByIdAndDelete({
    user: userId,
    group: groupId,
    type: "group",
    status: "accepted",
  });

  res.status(200).json({ success: true });
});

//@desc accept request
//@route PUT api/v1/groups/:id/:action
//@access protected admin
exports.actionGroupRequest = asyncHandler(async (req, res, next) => {
  const { groupRequest } = req;
  const { action } = req.params;
  //action must be accept or reject
  if (action && !["accept", "reject"].includes(action)) {
    return next(new ApiError(`Type must be accept or reject`, 400));
  }

  if (action === "accept") {
    groupRequest.status = "accepted";
    groupRequest.acceptedAt = Date.now();
  } else {
    groupRequest.status = "rejected";
    groupRequest.rejectedAt = Date.now();
  }
  await groupRequest.save();
  res.status(200).json({ success: true, groupRequest });
});

//@desc get  request
//@route GET api/v1/groups/:id/requests
//@access protected
exports.filterGroupsRequestForLoggedUser = (req, res, next) => {
  let filterObject = {};
  if (req.user.role === "admin") {
    filterObject = { group: req.params.id };
  } else {
    filterObject = { createdBy: req.user._id, group: req.params.id };
  }
  req.filterObj = filterObject;
  next();
};
exports.getAllGroupRequests = factory.getALl(Request);
