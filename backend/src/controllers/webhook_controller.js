const {
  PurchaseRequest,
  PurchaseRequestItem,
  Product,
  Stock,
  sequelize
} = require("../models");

module.exports = {
  async receiveStock(req, res) {
    const t = await sequelize.transaction();

    try {
      const { reference, vendor, details } = req.body;

      // -------------------------------------------------------------
      // BASIC VALIDATION
      // -------------------------------------------------------------
      if (!reference || !vendor || !details || details.length === 0) {
        await t.rollback();
        return res.status(400).json({
          response_code: 400,
          response_message: "reference, vendor, and details[] are required"
        });
      }

      // -------------------------------------------------------------
      // 1️⃣ LOOKUP PURCHASE REQUEST
      // -------------------------------------------------------------
      const pr = await PurchaseRequest.findOne({
        where: { reference },
        include: [{ model: PurchaseRequestItem, as: "items" }]
      });

      if (!pr) {
        await t.rollback();
        return res.status(404).json({
          response_code: 404,
          response_message: `Purchase Request ${reference} not found`
        });
      }

      const warehouseId = pr.warehouse_id;

      // -------------------------------------------------------------
      // 2️⃣ IDEMPOTENCY CHECK
      // -------------------------------------------------------------
      if (pr.status === "COMPLETED") {
        await t.rollback();
        return res.status(200).json({
          response_code: 200,
          response_message: "Stock already processed — skipping",
          data: { reference, status: pr.status }
        });
      }

      if (pr.status !== "PENDING") {
        await t.rollback();
        return res.status(400).json({
          response_code: 400,
          response_message: `Purchase Request must be PENDING before receiving stock. Current: ${pr.status}`
        });
      }

      // -------------------------------------------------------------
      // 3️⃣ VALIDATION — WEBHOOK MUST MATCH PR ITEMS
      // -------------------------------------------------------------
      const prItems = pr.items.map(item => ({
        product_id: item.product_id,
        qty: item.quantity
      }));

      const webhookItems = [];

      for (const item of details) {
        const product = await Product.findOne({
          where: { sku: item.sku_barcode }
        });

        if (!product) {
          await t.rollback();
          return res.status(400).json({
            response_code: 400,
            response_message: `Unknown SKU in webhook: ${item.sku_barcode}`
          });
        }

        webhookItems.push({
          product_id: product.id,
          qty: item.qty
        });
      }

      if (prItems.length !== webhookItems.length) {
        await t.rollback();
        return res.status(400).json({
          response_code: 400,
          response_message: "Webhook item count does not match PR items"
        });
      }

      // Deep compare
      for (const prItem of prItems) {
        const match = webhookItems.find(
          w => w.product_id === prItem.product_id && w.qty === prItem.qty
        );

        if (!match) {
          await t.rollback();
          return res.status(400).json({
            response_code: 400,
            response_message: "Webhook details do not match PR items (SKU/qty mismatch)"
          });
        }
      }

      // -------------------------------------------------------------
      // 4️⃣ UPDATE STOCK
      // -------------------------------------------------------------
      for (const item of webhookItems) {
        const { product_id, qty } = item;

        let stock = await Stock.findOne({
          where: { warehouse_id: warehouseId, product_id }
        });

        if (!stock) {
          await Stock.create(
            { warehouse_id: warehouseId, product_id, quantity: qty },
            { transaction: t }
          );
        } else {
          stock.quantity += qty;
          await stock.save({ transaction: t });
        }
      }

      // -------------------------------------------------------------
      // 5️⃣ MARK PR AS COMPLETED
      // -------------------------------------------------------------
      pr.status = "COMPLETED";
      await pr.save({ transaction: t });

      await t.commit();

      return res.status(200).json({
        response_code: 200,
        response_message: "Stock received successfully",
        data: {
          reference,
          warehouse_id: warehouseId,
          status: "COMPLETED"
        }
      });

    } catch (error) {
      console.error(error);
      await t.rollback();

      return res.status(500).json({
        response_code: 500,
        response_message: "Server error",
        error: error.message
      });
    }
  }
};
