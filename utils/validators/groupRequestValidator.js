const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const GroupRequest = require("../../models/groupRequestModel");
const Group = require("../../models/groupModel");
const User = require("../../models/userModel");

exports.processGroupRequestValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Requst id format")
    .custom((val, { req }) =>
      GroupRequest.findById(val).then((request) => {
        if (!request) {
          return Promise.reject(new Error(`Request not found`));
        }
        return Group.findById(request.group).then((group) => {
          if (group.createdBy._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error(`Your are not allowed to perform this action`)
            );
          }
        });
      })
    ),

  validatorMiddleware,
];

exports.getGroupRequestValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Requst id format")
    .custom((val, { req }) =>
      GroupRequest.findById(val).then((request) => {
        if (!request) {
          return Promise.reject(new Error(`Request not found`));
        }
        return User.findById(req.user._id).then((user) => {
          if (user.role === "admin") {
            return true;
          }
          if (request.user._id.toString() !== user._id.toString()) {
            return Promise.reject(
              new Error(`Your are not allowed to perform this action`)
            );
          }
        });
      })
    ),

  validatorMiddleware,
];
