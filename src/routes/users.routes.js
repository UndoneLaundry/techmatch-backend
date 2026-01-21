const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { updateMeValidator, changePasswordValidator } = require("../validators/users.validators");
const { updateMe, changePassword, deleteMe } = require("../controllers/users.controller");

router.patch("/me", requireAuth, updateMeValidator, validate, updateMe);
router.patch("/me/password", requireAuth, changePasswordValidator, validate, changePassword);
router.delete("/me", requireAuth, deleteMe);

module.exports = router;
