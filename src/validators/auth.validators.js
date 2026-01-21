const { body } = require("express-validator");

const registerValidator = [
  body("role").isIn(["TECHNICIAN", "BUSINESS", "AGENCY"]).withMessage("Invalid role"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isString()
    .isLength({ min: 10 })
    .withMessage("Password must be at least 10 characters"),
];

const loginValidator = [
  body("email").isEmail(),
  body("password").isString().notEmpty(),
];

module.exports = { registerValidator, loginValidator };
