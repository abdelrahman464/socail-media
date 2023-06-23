const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const ConnectionRequest = require("../../models/connectionRequestModel");

exports.processConnectionRequestValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Requst id format")
    .custom((val, { req }) =>
      ConnectionRequest.findById(val).then((r) => {
        if (!r) {
          return Promise.reject(new Error(`Request not found`));
        }
        if (r.toUser._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),

  validatorMiddleware,
];

exports.deleteConnectionRequestValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Requst id format")
    .custom((val, { req }) =>
      ConnectionRequest.findById(val).then((r) => {
        if (!r) {
          return Promise.reject(new Error(`Request not found`));
        }
        if (req.user.role === "admin") {
          return true;
        }
        if (r.fromUser._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),

  validatorMiddleware,
];
exports.getConnectionRequestValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Requst id format")
    .custom((val, { req }) =>
      ConnectionRequest.findById(val).then((r) => {
        if (!r) {
          return Promise.reject(new Error(`Request not found`));
        }
        if (req.user.role === "admin") {
          return true;
        }
        if (
          r.toUser._id.toString() !== req.user._id.toString() &&
          r.fromUser._id.toString() !== req.user._id.toString()
        ) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),

  validatorMiddleware,
];
