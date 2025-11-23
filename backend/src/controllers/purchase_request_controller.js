const {
  PurchaseRequest,
  PurchaseRequestItem,
  Product,
  Stock,
  Warehouse,
  sequelize
} = require('../models');

module.exports = {
  async getAllPurchaseRequests(req, res) {
    try {
      const prs = await PurchaseRequest.findAll({
        include: [
          { model: PurchaseRequestItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }] },
          { model: Warehouse, as: 'warehouse', attributes: ['id', 'name'] }
        ],
        order: [['id', 'DESC']]
      });

      const data = prs.map((p) => (p.toJSON ? p.toJSON() : p));

      return res.json({ response_code: 200, response_message: 'Success', data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ response_code: 500, response_message: 'Server error', error: error.message });
    }
  },

  async getPurchaseRequest(req, res) {
    try {
      const { id } = req.params;
      const pr = await PurchaseRequest.findOne({
        where: { id },
        include: [
          { model: PurchaseRequestItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }] },
          { model: Warehouse, as: 'warehouse', attributes: ['id', 'name'] }
        ]
      });

      if (!pr) {
        return res.status(404).json({ response_code: 404, response_message: `Purchase Request ID ${id} not found` });
      }

      return res.json({ response_code: 200, response_message: 'Success', data: pr.toJSON ? pr.toJSON() : pr });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ response_code: 500, response_message: 'Server error', error: error.message });
    }
  },
  async createPurchaseRequest(req, res) {
    const t = await sequelize.transaction();

    try {
      const { vendor, reference, qty_total, details, warehouse_id } = req.body;

      // ------------------------------
      // BASIC VALIDATION
      // ------------------------------
      if (!vendor || !reference || !qty_total || !details || details.length === 0) {
        return res.status(400).json({
          response_code: 400,
          response_message: "vendor, reference, qty_total, and details[] are required"
        });
      }

      // Check if reference already exists
      const existing = await PurchaseRequest.findOne({ where: { reference } });
      if (existing) {
        return res.status(400).json({
          response_code: 400,
          response_message: `Reference ${reference} already exists`
        });
      }

      // Validate total qty
      const sumQty = details.reduce((sum, d) => sum + d.qty, 0);
      if (sumQty !== qty_total) {
        return res.status(400).json({
          response_code: 400,
          response_message: `qty_total mismatch. Expected ${qty_total}, but sum of details is ${sumQty}`
        });
      }

    if (warehouse_id) {
        const warehouseExists = await Warehouse.findOne({ where: { id: warehouse_id } });

        if (!warehouseExists) {
            return res.status(400).json({
            response_code: 400,
            response_message: `Warehouse with ID ${warehouse_id} does not exist`
            });
        }
    }

      // ------------------------------
      // DETERMINE WAREHOUSE
      // ------------------------------
      let selectedWarehouseId = warehouse_id || null;

      // If warehouse_id not provided → auto-select based on lowest stock
      if (!selectedWarehouseId) {
        for (const item of details) {
          const product = await Product.findOne({
            where: { sku: item.sku_barcode }
          });

          if (!product) {
            return res.status(400).json({
              response_code: 400,
              response_message: `Product with SKU ${item.sku_barcode} not found`
            });
          }

          // Select warehouse with LOWEST stock
          const stock = await Stock.findOne({
            where: { product_id: product.id },
            order: [['quantity', 'ASC']]
          });

          if (!stock) {
            return res.status(400).json({
              response_code: 400,
              response_message: `No stock found for SKU ${item.sku_barcode}`
            });
          }

          if (!selectedWarehouseId) {
            selectedWarehouseId = stock.warehouse_id;
          }
        }
      }

      // ------------------------------
      // CREATE PURCHASE REQUEST
      // ------------------------------
      const purchaseRequest = await PurchaseRequest.create(
        {
          vendor,
          reference,
          qty_total,
          warehouse_id: selectedWarehouseId,
          status: "DRAFT"
        },
        { transaction: t }
      );

      // ------------------------------
      // CREATE PURCHASE REQUEST ITEMS
      // ------------------------------
      for (const item of details) {
        const product = await Product.findOne({
          where: { sku: item.sku_barcode }
        });

        await PurchaseRequestItem.create(
          {
            purchase_request_id: purchaseRequest.id,
            product_id: product.id,
            quantity: item.qty
          },
          { transaction: t }
        );
      }

      await t.commit();

      // ------------------------------------------
      // STATUS FLOW MANAGEMENT (ASYNC)
      // ------------------------------------------

      if (vendor.trim().toUpperCase() === "PT FOOM LAB GLOBAL") {
        setTimeout(async () => {
          await PurchaseRequest.update(
            { status: "REQUEST_CONFIRM" },
            { where: { id: purchaseRequest.id } }
          );
        }, 30000);

        setTimeout(async () => {
          await PurchaseRequest.update(
            { status: "PENDING" },
            { where: { id: purchaseRequest.id } }
          );
        }, 60000);
      } else {
        setTimeout(async () => {
          await PurchaseRequest.update(
            { status: "REQUEST_REJECTED" },
            { where: { id: purchaseRequest.id } }
          );
        }, 30000);
      }

      // ------------------------------
      // RESPONSE
      // ------------------------------
      return res.status(201).json({
        response_code: 201,
        response_message: "Purchase request created successfully",
        data: {
          id: purchaseRequest.id,
          reference: purchaseRequest.reference,
          status: purchaseRequest.status,
          warehouse_id: purchaseRequest.warehouse_id
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
  },
  async updatePurchaseRequest(req, res) {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { vendor, reference, qty_total, details, warehouse_id } = req.body;

        // --------------------------
        // 1️⃣ Check PR existence
        // --------------------------
        const pr = await PurchaseRequest.findOne({
        where: { id, reference },
        include: [{ model: PurchaseRequestItem, as: "items" }]
        });

        if (!pr) {
        return res.status(400).json({
            response_code: 400,
            response_message: `Purchase Request ID ${id} does not exist`
        });
        }

        // --------------------------
        // 2️⃣ If not in DRAFT → create new PR
        // --------------------------
        if (pr.status !== "DRAFT") {

        // Generate next reference
        const match = pr.reference.match(/([A-Za-z]+)(\d+)/);
        const prefix = match[1];
        const number = parseInt(match[2], 10) + 1;
        const newReference = `${prefix}${number.toString().padStart(match[2].length, "0")}`;

        req.body.reference = newReference;

        return module.exports.createPurchaseRequest(req, res);
        }

        // --------------------------
        // 3️⃣ Validate fields
        // --------------------------
        if (!vendor || !reference || !qty_total || !details || details.length === 0) {
        return res.status(400).json({
            response_code: 400,
            response_message: "vendor, reference, qty_total, and details[] are required"
        });
        }

        const sumQty = details.reduce((sum, d) => sum + d.qty, 0);
        if (sumQty !== qty_total) {
        return res.status(400).json({
            response_code: 400,
            response_message: `qty_total mismatch. Expected ${qty_total}, got ${sumQty}`
        });
        }

        if (warehouse_id) {
        const wh = await Warehouse.findOne({ where: { id: warehouse_id } });
        if (!wh) {
            return res.status(400).json({
            response_code: 400,
            response_message: `Warehouse ${warehouse_id} does not exist`
            });
        }
        }

        // --------------------------
        // 4️⃣ Update PR header only
        // --------------------------
        pr.vendor = vendor;
        pr.reference = reference;
        pr.qty_total = qty_total;

        if (warehouse_id) {
        pr.warehouse_id = warehouse_id;
        }

        await pr.save({ transaction: t });

        // --------------------------
        // 5️⃣ Update OR Insert PR items (no deleting)
        // --------------------------
        for (const item of details) {
        const product = await Product.findOne({
            where: { sku: item.sku_barcode }
        });

        if (!product) {
            return res.status(400).json({
            response_code: 400,
            response_message: `Product SKU ${item.sku_barcode} not found`
            });
        }

        const existingItem = pr.items.find(
            (i) => i.product_id === product.id
        );

        if (existingItem) {
            // UPDATE existing item quantity
            existingItem.quantity = item.qty;
            await existingItem.save({ transaction: t });
        } else {
            // CREATE new item
            await PurchaseRequestItem.create(
            {
                purchase_request_id: pr.id,
                product_id: product.id,
                quantity: item.qty
            },
            { transaction: t });
            }
        }

        await t.commit();

        return res.status(200).json({
        response_code: 200,
        response_message: "Purchase request updated successfully",
        data: {
                id: pr.id,
                reference: pr.reference,
                status: pr.status,
                warehouse_id: pr.warehouse_id
            }
        });
    } catch (err) {
        console.error(err);
        await t.rollback();
        return res.status(500).json({
                response_code: 500,
                response_message: "Server error",
                error: err.message
            });
        }
    },
    async deletePurchaseRequest(req, res) {
        const t = await sequelize.transaction();

        try {
            const { id } = req.params;

            // 1️⃣ Find the purchase request
            const pr = await PurchaseRequest.findOne({ where: { id } });

            if (!pr) {
            return res.status(404).json({
                response_code: 404,
                response_message: `Purchase Request ID ${id} does not exist`
            });
            }

            // 2️⃣ Check status
            if (pr.status !== "DRAFT") {
            return res.status(400).json({
                response_code: 400,
                response_message: `Purchase Request ID ${id} cannot be deleted because its status is ${pr.status}`
            });
            }

            // 3️⃣ Delete the purchase request items first
            await PurchaseRequestItem.destroy({
            where: { purchase_request_id: id },
            transaction: t
            });

            // 4️⃣ Delete the purchase request
            await PurchaseRequest.destroy({
            where: { id },
            transaction: t
            });

            await t.commit();

            return res.status(200).json({
            response_code: 200,
            response_message: `Purchase Request ID ${id} deleted successfully`
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
