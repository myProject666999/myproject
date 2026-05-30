const express = require("express");
const router = express.Router();
const {
  startSession,
  autoSaveAnswers,
  getAutoSavedAnswers,
  submitAnswers,
  getSession,
  getSessionResult,
} = require("../controllers/answerController");
const { optionalAuth } = require("../middleware/auth");

router.post("/start", optionalAuth, startSession);
router.get("/:session_uuid", getSession);
router.put("/:session_uuid/auto-save", autoSaveAnswers);
router.get("/:session_uuid/auto-save", getAutoSavedAnswers);
router.post("/:session_uuid/submit", submitAnswers);
router.get("/:session_uuid/result", getSessionResult);

module.exports = router;
