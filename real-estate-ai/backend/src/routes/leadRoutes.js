const { Router } = require("express");
const {
  getLeads,
  postLead,
  postLeadCapture,
  postLeadEvent,
  getHotLeads,
  getLeadDistribution,
  getCRMOverview,
} = require("../controllers/leadController");

const router = Router();

router.get("/crm", getCRMOverview);
router.get("/distribution", getLeadDistribution);
router.get("/hot", getHotLeads);
router.post("/capture", postLeadCapture);
router.post("/events", postLeadEvent);
router.get("/", getLeads);
router.post("/", postLead);

module.exports = router;
