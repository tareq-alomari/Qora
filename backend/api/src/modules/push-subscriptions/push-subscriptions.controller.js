const pushSubService = require('./push-subscriptions.service');

const subscribe = async (req, res, next) => {
  try {
    const result = await pushSubService.subscribe(req.user.id, req.body);
    res.status(201).json({ data: result, message: 'تم الاشتراك في الإشعارات' });
  } catch (err) {
    next(err);
  }
};

const unsubscribe = async (req, res, next) => {
  try {
    await pushSubService.unsubscribe(req.user.id, req.body.endpoint);
    res.json({ message: 'تم إلغاء الاشتراك في الإشعارات' });
  } catch (err) {
    next(err);
  }
};

module.exports = { subscribe, unsubscribe };
