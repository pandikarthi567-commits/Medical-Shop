const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
  resetSettings,
  backupData,
  clearLogs,
} = require("../controllers/settingsController");

router.get("/", getSettings);
router.put("/", updateSettings);
router.post("/reset", resetSettings);
router.post("/backup", backupData);
router.post("/clear-logs", clearLogs);

module.exports = router;
