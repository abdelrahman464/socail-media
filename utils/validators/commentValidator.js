const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Comment = require("../../models/commentModel");

exports.deleteCommentValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Requst id format")
    .custom((val, { req }) =>
      Comment.findById(val).then(async (com) => {
        if (!com) {
          return Promise.reject(new Error(`comment not found`));
        }

        if (req.user.role === "admin") {
          return true;
        }
        if (com.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),

  validatorMiddleware,
];
exports.updateCommentValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Requst id format")
    .custom((val, { req }) =>
      Comment.findById(val).then(async (com) => {
        if (!com) {
          return Promise.reject(new Error(`comment not found`));
        }
        if (com.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),

  validatorMiddleware,
];
