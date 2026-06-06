const { Router } = require("express");
const {
  getProperties,
  getProperty,
  getDealAlerts,
  getPricePrediction,
} = require("../controllers/propertyController");

const router = Router();

router.get("/deal-alerts", getDealAlerts);
router.get("/:id/price-prediction", getPricePrediction);
router.get("/", getProperties);
router.get("/:id", getProperty);

module.exports = router;
