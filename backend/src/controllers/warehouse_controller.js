const { Warehouse, Stock } = require('../models');

module.exports = {
  async getAllWarehouses(req, res) {
    try {
      const warehouses = await Warehouse.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
      });

      return res.json({ response_code: 200, response_message: 'Success', data: warehouses });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ response_code: 500, response_message: 'Server error', error: error.message });
    }
  },

  async getWarehouse(req, res) {
    try {
      const { id } = req.params;
      const warehouse = await Warehouse.findOne({
        where: { id },
        attributes: ['id', 'name'],
        include: [{ model: Stock, as: 'stocks', attributes: ['id', 'product_id', 'quantity'] }]
      });

      if (!warehouse) {
        return res.status(404).json({ response_code: 404, response_message: `Warehouse ID ${id} not found` });
      }

      return res.json({ response_code: 200, response_message: 'Success', data: warehouse });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ response_code: 500, response_message: 'Server error', error: error.message });
    }
  }
};
