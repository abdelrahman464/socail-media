const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Group = require("../../models/groupModel");
const User = require("../../models/userModel");

exports.deleteGroupValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Requst id format")
    .custom((val, { req }) =>
      Group.findById(val).then((group) => {
        if (!group) {
          return Promise.reject(new Error(`Group not found`));
        }
        return User.findById(req.user._id).then((user) => {
          if (user.role === "admin") {
            return true;
          }
          if (group.createdBy._id.toString() !== user._id.toString()) {
            return Promise.reject(
              new Error(`Your are not allowed to perform this action`)
            );
          }
        });
      })
    ),

  validatorMiddleware,
];
