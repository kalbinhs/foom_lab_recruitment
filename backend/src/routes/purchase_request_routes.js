const express = require('express');
const router = express.Router();

const purchaseRequestController = require('../controllers/purchase_request_controller');

router.post('/', purchaseRequestController.createPurchaseRequest);
router.get('/', purchaseRequestController.getAllPurchaseRequests);
router.get('/:id', purchaseRequestController.getPurchaseRequest);
router.put('/:id', purchaseRequestController.updatePurchaseRequest);
router.delete('/:id', purchaseRequestController.deletePurchaseRequest);

module.exports = router;
