const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const admin = require("../controllers/admin.controller");

router.get("/verifications", requireAuth, requireRole("ADMIN"), admin.listVerifications);
router.post("/verifications/:id/approve", requireAuth, requireRole("ADMIN"), admin.approveVerification);
router.post("/verifications/:id/reject", requireAuth, requireRole("ADMIN"), admin.rejectVerification);

router.get("/skills", requireAuth, requireRole("ADMIN"), admin.listSkillSubmissions);
router.post("/skills/:id/approve", requireAuth, requireRole("ADMIN"), admin.approveSkillSubmission);
router.post("/skills/:id/reject", requireAuth, requireRole("ADMIN"), admin.rejectSkillSubmission);

module.exports = router;
