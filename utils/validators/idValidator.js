const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.idValidator = function (...fieldNames) {
  const validations = fieldNames.map((fieldName) =>
    check(fieldName).isMongoId().withMessage(`Invalid ${fieldName} format`)
  );

  // Append the validatorMiddleware to handle the validation results
  validations.push(validatorMiddleware);
  return validations;
};
