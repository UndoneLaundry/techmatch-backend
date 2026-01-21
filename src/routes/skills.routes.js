const router = require("express").Router();
const path = require("path");
const { requireAuth } = require("../middleware/auth");
const { makeUploader } = require("../middleware/upload");
const { validate } = require("../middleware/validate");
const { submitSkillValidator } = require("../validators/skills.validators");
const { submitSkill, mySkillSubmissions } = require("../controllers/skills.controller");

const uploader = makeUploader(path.join(process.cwd(), "uploads", "skills"));

router.post(
  "/submit",
  requireAuth,
  uploader.fields([{ name: "certifications", maxCount: 10 }]),
  submitSkillValidator,
  validate,
  submitSkill
);

router.get("/my-submissions", requireAuth, mySkillSubmissions);

module.exports = router;
