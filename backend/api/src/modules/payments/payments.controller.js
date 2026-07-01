const paymentService = require('./payments.service');

const getMethods = (req, res, next) => {
  try {
    const methods = paymentService.getMethods();
    res.json({ data: methods });
  } catch (err) {
    next(err);
  }
};

const listReceipts = async (req, res, next) => {
  try {
    const result = await paymentService.listReceipts(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMethods, listReceipts };
