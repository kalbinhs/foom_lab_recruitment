const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhook_controller");

// POST /api/webhook/receive-stock
router.post("/receive-stock", webhookController.receiveStock);

module.exports = router;
