'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'purchase_request_items',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        purchase_request_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'purchase_requests',
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
          onDelete: 'RESTRICT'
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false
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
      'purchase_request_items',
      {
        fields: ['purchase_request_id', 'product_id'],
        type: 'unique',
        name: 'unique_pritem_per_pr_product',
        transaction: false
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'purchase_request_items',
      'unique_pritem_per_pr_product',
      { transaction: false }
    );

    await queryInterface.dropTable('purchase_request_items', { transaction: false });
  }
};
