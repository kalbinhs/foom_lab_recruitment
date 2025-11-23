const { Product } = require("../models");

module.exports = {
  // ---------------------------------------
  // GET /api/products → List all products
  // ---------------------------------------
  async getAllProducts(req, res) {
    try {
      const products = await Product.findAll({
        attributes: ["id", "name", "sku", "createdAt", "updatedAt"]
      });

      return res.status(200).json({
        response_code: 200,
        response_message: "Success",
        data: products
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        response_code: 500,
        response_message: "Server error",
        error: error.message
      });
    }
  },

  // ---------------------------------------
  // POST /api/products → Create new product
  // ---------------------------------------
  async createProduct(req, res) {
    try {
      const { product_name, sku_barcode } = req.body;

      // Validate fields
      if (!product_name || !sku_barcode) {
        return res.status(400).json({
          response_code: 400,
          response_message: "product_name and sku_barcode are required"
        });
      }

      // Check for existing product by SKU
      const existing = await Product.findOne({
        where: { sku: sku_barcode }
      });

      if (existing) {
        return res.status(400).json({
          response_code: 400,
          response_message: `SKU ${sku_barcode} already exists`
        });
      }

      // Create new product
      const product = await Product.create({
        name: product_name,
        sku: sku_barcode
      });

      return res.status(201).json({
        response_code: 201,
        response_message: "Product created successfully",
        data: product
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        response_code: 500,
        response_message: "Server error",
        error: error.message
      });
    }
  }
};
