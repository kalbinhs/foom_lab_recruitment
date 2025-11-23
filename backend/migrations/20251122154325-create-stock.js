'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'stocks',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        warehouse_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'warehouses',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('NOW()')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('NOW()')
        }
      },
      { transaction: false }
    );

    await queryInterface.addConstraint(
      'stocks',
      {
        fields: ['warehouse_id', 'product_id'],
        type: 'unique',
        name: 'unique_stock_per_warehouse_product',
        transaction: false
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'stocks',
      'unique_stock_per_warehouse_product',
      { transaction: false }
    );

    await queryInterface.dropTable('stocks', { transaction: false });
  }
};
