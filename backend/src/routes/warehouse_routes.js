const express = require('express');
const router = express.Router();

const warehouseController = require('../controllers/warehouse_controller');

router.get('/', warehouseController.getAllWarehouses);
router.get('/:id', warehouseController.getWarehouse);

module.exports = router;
