'use strict';

module.exports = (sequelize, DataTypes) => {
  const PurchaseRequestItem = sequelize.define('PurchaseRequestItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    purchase_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'purchase_request_items',
    underscored: true
  });

  PurchaseRequestItem.associate = function(models) {
    PurchaseRequestItem.belongsTo(models.PurchaseRequest, { foreignKey: 'purchase_request_id', as: 'purchaseRequest' });
    PurchaseRequestItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return PurchaseRequestItem;
};
