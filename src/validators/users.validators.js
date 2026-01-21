const { body } = require("express-validator");

const updateMeValidator = [
  body("profile.fullName").optional().isString().isLength({ max: 120 }),
  body("profile.phone").optional().isString().isLength({ max: 30 }),

  body("profile.businessName").optional().isString().isLength({ max: 200 }),
  body("profile.contactPerson").optional().isString().isLength({ max: 120 }),
  body("profile.address").optional().isString().isLength({ max: 300 }),
  body("profile.uen").optional().isString().isLength({ max: 50 }),

  body("profile.agencyName").optional().isString().isLength({ max: 200 }),
];

const changePasswordValidator = [
  body("currentPassword").isString().notEmpty(),
  body("newPassword").isString().isLength({ min: 10 }),
];

module.exports = { updateMeValidator, changePasswordValidator };
