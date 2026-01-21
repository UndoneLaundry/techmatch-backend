const { body } = require("express-validator");

const submitSkillValidator = [
  body("skillName").isString().isLength({ min: 2, max: 120 }),
  body("certTitles")
    .optional()
    .custom((v) => {
      // certTitles can be a JSON string array or array; we normalize in controller
      return true;
    }),
];

module.exports = { submitSkillValidator };
