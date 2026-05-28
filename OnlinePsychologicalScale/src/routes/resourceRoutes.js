const express = require("express");
const router = express.Router();
const {
  listResources,
  getResourceDetail,
  listCategories,
  listHotlines,
} = require("../controllers/resourceController");

router.get("/categories", listCategories);
router.get("/hotlines", listHotlines);
router.get("/", listResources);
router.get("/:id", getResourceDetail);

module.exports = router;
