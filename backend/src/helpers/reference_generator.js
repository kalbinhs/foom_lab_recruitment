const { PurchaseRequest } = require('../models');

module.exports = {
  async generatePRReference() {
    const lastPR = await PurchaseRequest.findOne({
      order: [['id', 'DESC']]
    });

    let nextNumber = 1;

    if (lastPR) {
      const lastRef = lastPR.reference.replace('PR', '');
      nextNumber = parseInt(lastRef) + 1;
    }

    return `PR${String(nextNumber).padStart(5, '0')}`;
  }
};
