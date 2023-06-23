const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const ConnectionRequest = require("../models/connectionRequestModel");

// exports.connectFriends = asyncHandler(async (req, res, next) => {
//   const { friendId } = req.body;
//   const userId = req.user._id;
//   // Find the user by userId
//   const user = await User.findById(userId);
//   if (!user) {
//     return next(new ApiError(`User not found`, 404));
//   }

//   // Find the friend by friendId
//   const friend = await User.findById(friendId);
//   if (!friend) {
//     return next(new ApiError(`Friend not found`, 404));
//   }

//   // Check if the friend request already exists
//   const existingRequest = user.connectionRequests.find(
//     (request) => request.user.toString() === friendId.toString()
//   );

//   if (existingRequest) {
//     return res.status(400).json({ error: "Connection request already sent" });
//   }

//   // Create a connection request
//   const request = {
//     user: friendId,
//     status: "pending",
//   };

//   // Add the connection request to the user's connectionRequests array
//   user.connectionRequests.push(request);

//   // Save the updated user document
//   await user.save();

//   res.json({ message: "Connection request sent successfully" });
// });

// exports.acceptFriendRequest = asyncHandler(async (req, res, next) => {
//   const { requestId } = req.body;
//   const userId = req.user._id;
//   // Find the user by userId
//   const user = await User.findById(userId);
//   if (!user) {
//     return next(new ApiError(`User not found`, 404));
//   }

//   // Find the connection request by requestId
//   const request = user.connectionRequests.find(
//     (r) => r._id.toString() === requestId.toString()
//   );
//   if (!request) {
//     return next(new ApiError(`Connection request not found`, 404));
//   }

//   // Check if the request is already accepted
//   if (request.status !== "pending") {
//     return next(new ApiError(`Connection request already processed`, 400));
//   }
//   // Update the request status to 'accepted'
//   request.status = "accepted";

//   // Add the friendId to the user's connections array
//   user.connections.push(request.user);

//   // Save the updated user document
//   await user.save();

//   res.json({ message: "Friend request accepted successfully" });
// });

// exports.declineFriendRequest = asyncHandler(async (req, res, next) => {
//   const { requestId } = req.body;
//   const userId = req.user._id;
//   // Find the user by userId
//   const user = await User.findById(userId);
//   if (!user) {
//     return next(new ApiError(`User not found`, 404));
//   }

//   // Find the connection request by requestId
//   const requestIndex = user.connectionRequests.findIndex(
//     (r) => r._id.toString() === requestId.toString()
//   );
//   if (requestIndex === -1) {
//     return next(new ApiError(`Connection request not found`, 404));
//   }

//   // Check if the request is already accepted
//   if (user.connectionRequests[requestIndex].status !== "pending") {
//     return next(new ApiError(`Connection request already processed`, 400));
//   }
//   // Remove the connection request from the user's connectionRequests array
//   user.connectionRequests.splice(requestIndex, 1);

//   // Save the updated user document
//   await user.save();

//   res.json({ message: "Friend request declined successfully" });
// });
//@desc
//@route POST
//@access protected user
exports.connectFriends = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //friendId
  const userId = req.user._id;
  //1- check if the group exists
  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError(`User not found `, 404));
  }
  //2- check if the request sent before
  const existingRequest = await ConnectionRequest.findOne({
    toUser: id,
    fromUser: userId,
  });
  if (existingRequest) {
    return next(new ApiError(`Request already sent`, 400));
  }
  //3- send the request
  const friendRequest = await ConnectionRequest.create({
    toUser: id,
    fromUser: userId,
  });
  //4- Add the connection request to the user's connectionRequests
  await User.findByIdAndUpdate(userId, {
    $push: { connectionRequests: friendRequest._id },
  });
  await User.findByIdAndUpdate(id, {
    $push: { connectionRequests: friendRequest._id },
  });

  res.status(201).json({ success: true, friendRequest });
});
//@desc
//@route Delete
//@access protected user
exports.endFriendship = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //friendId
  const userId = req.user._id;
  //1- get the request that user made it to be add this friedn {friendId}
  const friendRequest = await ConnectionRequest.findOne({
    toUser: id,
    fromUser: userId,
    status: "accepted",
  });
  if (!friendRequest) {
    return next(new ApiError(`User Is Not Your Friend`, 404));
  }
  //2- check if user left the friendship
  if (friendRequest.leftAt) {
    return next(new ApiError(`User has already left you`, 400));
  }
  //3- set the current date as the date user left in
  friendRequest.removeAt = new Date();
  await friendRequest.save();

  //4- Remove user from the connections list of the other user
  const loggedUser = await User.findById(userId);
  loggedUser.connections = loggedUser.connections.filter(
    (connections) => connections.friendId.toString() !== userId.toString()
  );
  await loggedUser.save();
  //5- Remove user from the connections list of the other user
  const friendUser = await User.findById(id);
  friendUser.connections = friendUser.connections.filter(
    (connections) => connections.userId.toString() !== userId.toString()
  );
  await friendUser.save();

  res.status(200).json({ success: true });
});
