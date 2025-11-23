'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: { type: DataTypes.STRING(255), allowNull: false },
    sku: { type: DataTypes.STRING(255), allowNull: false, unique: true }
  }, {
    tableName: 'products',
    underscored: true
  });

  Product.associate = function(models) {
    Product.hasMany(models.Stock, { foreignKey: 'product_id', as: 'stocks' });
    Product.hasMany(models.PurchaseRequestItem, { foreignKey: 'product_id', as: 'purchaseRequestItems' });
  };

  return Product;
};
