const pushSubModel = require('./push-subscriptions.model');

const subscribe = async (userId, data) => {
  const existing = await pushSubModel.findByUserAndEndpoint(userId, data.endpoint);
  if (existing) {
    const [updated] = await pushSubModel.updateKeys(existing.id, data.keys);
    return updated;
  }
  const [subscription] = await pushSubModel.create({
    user_id: userId,
    endpoint: data.endpoint,
    keys: data.keys,
  });
  return subscription;
};

const unsubscribe = async (userId, endpoint) => {
  await pushSubModel.deleteByUserAndEndpoint(userId, endpoint);
};

module.exports = { subscribe, unsubscribe };
