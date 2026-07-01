const resultsService = require('./results.service');

const check = async (req, res, next) => {
  try {
    const result = await resultsService.check(req.params.id, req.user.id);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
};

const getResult = async (req, res, next) => {
  try {
    const result = await resultsService.getResult(req.params.id, req.user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

const getResultByConfirmation = async (req, res, next) => {
  try {
    const result = await resultsService.getResultByConfirmation(req.params.confirmation);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

const updateResult = async (req, res, next) => {
  try {
    const result = await resultsService.updateResult(req.params.id, req.body);
    res.json({ data: result, message: 'تم تحديث النتيجة' });
  } catch (err) {
    next(err);
  }
};

const updateConfirmation = async (req, res, next) => {
  try {
    const result = await resultsService.updateConfirmation(req.params.id, req.body.confirmation_number);
    res.json({ data: result, message: 'تم تحديث رقم التأكيد' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  check,
  getResult,
  getResultByConfirmation,
  updateResult,
  updateConfirmation,
};
