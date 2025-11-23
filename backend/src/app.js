const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/product_routes');
const stockRoutes = require('./routes/stock_routes');
const purchaseRequestRoutes = require('./routes/purchase_request_routes');
const warehouseRoutes = require('./routes/warehouse_routes');
const webhookRoutes = require('./routes/webhook_routes');

const apiKeyAuth = require('./middleware/auth_middleware');

const app = express();

app.use(express.json());
app.use(cors());

app.use(apiKeyAuth);

app.use('/api/products', productRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/request/purchase', purchaseRequestRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/webhook', webhookRoutes);

module.exports = app;
