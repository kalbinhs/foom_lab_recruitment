'use strict';

module.exports = (sequelize, DataTypes) => {
  const PurchaseRequest = sequelize.define('PurchaseRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reference: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    warehouse_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'DRAFT'
    }
  }, {
    tableName: 'purchase_requests',
    underscored: true
  });

  PurchaseRequest.associate = function(models) {
    PurchaseRequest.belongsTo(models.Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
    PurchaseRequest.hasMany(models.PurchaseRequestItem, { foreignKey: 'purchase_request_id', as: 'items' });
  };

  return PurchaseRequest;
};
