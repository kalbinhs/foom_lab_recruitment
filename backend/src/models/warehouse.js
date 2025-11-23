'use strict';

module.exports = (sequelize, DataTypes) => {
  const Warehouse = sequelize.define('Warehouse', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'warehouses',
    underscored: true
  });

  Warehouse.associate = function(models) {
    Warehouse.hasMany(models.Stock, { foreignKey: 'warehouse_id', as: 'stocks' });
    Warehouse.hasMany(models.PurchaseRequest, { foreignKey: 'warehouse_id', as: 'purchaseRequests' });
  };

  return Warehouse;
};
