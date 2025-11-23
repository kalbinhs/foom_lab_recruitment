'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'purchase_requests',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        reference: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
        },
        warehouse_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'warehouses',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        status: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'DRAFT'
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('purchase_requests', { transaction: false });
  }
};
