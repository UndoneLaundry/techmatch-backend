const router = require("express").Router();
const { register, login, refresh, logout, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { registerValidator, loginValidator } = require("../validators/auth.validators");

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

module.exports = router;
