const express = require("express");
const router = express.Router();
const { getUserHistory, getTrend, getScaleComparison } = require("../controllers/trendController");
const { authMiddleware } = require("../middleware/auth");

router.get("/history", authMiddleware, getUserHistory);
router.get("/trend/:scale_id", authMiddleware, getTrend);
router.get("/comparison", authMiddleware, getScaleComparison);

module.exports = router;
