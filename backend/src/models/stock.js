'use strict';

module.exports = (sequelize, DataTypes) => {
  const Stock = sequelize.define('Stock', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    warehouse_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'stocks',
    underscored: true
  });

  Stock.associate = function(models) {
    Stock.belongsTo(models.Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
    Stock.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return Stock;
};
