const { Stock, Product, Warehouse } = require('../models');

module.exports = {
  async getAll(req, res) {
    try {
      const stocks = await Stock.findAll({
        include: [
          { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
          { model: Warehouse, as: 'warehouse', attributes: ['id', 'name'] }
        ],
        order: [
          ['warehouse_id', 'ASC'],
          ['product_id', 'ASC']
        ]
      });

      if (stocks.length === 0) {
        return res.status(404).json({ response_code: 404, response_message: 'No stock records found' });
      }

      // Map to plain objects and include warehouse name for convenience
      const data = stocks.map((s) => {
        const obj = s.toJSON ? s.toJSON() : s;
        return {
          id: obj.id,
          warehouse_id: obj.warehouse_id,
          warehouse_name: obj.warehouse ? obj.warehouse.name : null,
          product_id: obj.product_id,
          quantity: obj.quantity,
          createdAt: obj.createdAt,
          updatedAt: obj.updatedAt,
          product: obj.product || null
        };
      });

      return res.json({ response_code: 200, response_message: 'Success', data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ response_code: 500, response_message: 'Internal Server Error'});
    }
  }
};
