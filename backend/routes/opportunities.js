const express = require("express");
const {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require("../controllers/opportunityController");

const router = express.Router();

router.post("/", createOpportunity);
router.get("/", getOpportunities);
router.get("/:id", getOpportunity);
router.put("/:id", updateOpportunity);
router.delete("/:id", deleteOpportunity);

module.exports = router;
