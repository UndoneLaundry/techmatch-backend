const router = require("express").Router();
const path = require("path");
const { requireAuth } = require("../middleware/auth");
const { makeUploader } = require("../middleware/upload");
const { submitVerification, myVerification } = require("../controllers/verification.controller");

const uploader = makeUploader(path.join(process.cwd(), "uploads", "verification"));

// accept multiple named fields; frontend can choose these names
router.post(
  "/submit",
  requireAuth,
  uploader.fields([
    { name: "identity", maxCount: 5 },
    { name: "portfolio", maxCount: 5 },
    { name: "supportingDocs", maxCount: 10 },
    { name: "other", maxCount: 10 },
  ]),
  submitVerification
);

router.get("/my", requireAuth, myVerification);

module.exports = router;
