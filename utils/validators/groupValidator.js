const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Group = require("../../models/groupModel");
const Request = require("../../models/requestModel");

//@route POST /api/v1/groups
exports.createGroupValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("too short group name")
    .isLength({ max: 70 })
    .withMessage("too long group name"),
  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 15 })
    .withMessage("too short group Description")
    .isLength({ max: 1000 })
    .withMessage("too long group Description"),
  check("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["public", "private"])
    .withMessage("Type must be public or private"),
  validatorMiddleware,
];
//@route GET /api/v1/groups/:id
exports.getGroupValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Requst id format")
    .custom((val, { req }) =>
      Group.findById(val).then(async (group) => {
        if (!group) {
          return Promise.reject(new Error(`Group not found`));
        }
        if (
          group.createdBy._id.toString() !== req.user._id.toString() ||
          req.user.role === "admin"
        ) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
        if (group.type === "private") {
          Request.findOne({
            user: req.user._id,
            group: val,
            status: "accepted",
          }).then((request) => {
            if (!request) {
              return Promise.reject(
                new Error(`Your are not allowed to perform this action`)
              );
            }
          });
        }
      })
    ),

  validatorMiddleware,
];
//@route DELETE /api/v1/groups/:id
//@route PUT /api/v1/groups/:id
exports.actionGroupValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Requst id format")
    .custom((val, { req }) =>
      Group.findById(val).then((group) => {
        if (!group) {
          return Promise.reject(new Error(`Group not found`));
        }
        if (
          group.createdBy._id.toString() !== req.user._id.toString() ||
          req.user.role === "admin"
        ) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),

  validatorMiddleware,
];
