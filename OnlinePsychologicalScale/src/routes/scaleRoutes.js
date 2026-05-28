const express = require("express");
const router = express.Router();
const { listScales, getScaleDetail, getScaleInterpretations } = require("../controllers/scaleController");

router.get("/", listScales);
router.get("/:id", getScaleDetail);
router.get("/:id/interpretations", getScaleInterpretations);

module.exports = router;
