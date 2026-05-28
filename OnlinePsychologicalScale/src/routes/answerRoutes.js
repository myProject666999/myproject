const express = require("express");
const router = express.Router();
const {
  startSession,
  autoSaveAnswers,
  getAutoSavedAnswers,
  submitAnswers,
  getSessionResult,
} = require("../controllers/answerController");
const { optionalAuth } = require("../middleware/auth");

router.post("/start", optionalAuth, startSession);
router.put("/:session_uuid/auto-save", autoSaveAnswers);
router.get("/:session_uuid/auto-save", getAutoSavedAnswers);
router.post("/:session_uuid/submit", submitAnswers);
router.get("/:session_uuid/result", getSessionResult);

module.exports = router;
