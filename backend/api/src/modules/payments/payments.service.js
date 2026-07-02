const db = require('../../database/db');
const paymentModel = require('./payments.model');

const DEFAULT_ACCOUNTS = [
  { id: 'kuraimi', name: 'كريمي', account_number: '0123456789', account_name: 'Qor3a Yemen', is_active: true, order: 1 },
  { id: 'jeeb', name: 'جيب', account_number: '9876543210', account_name: 'Qor3a Yemen', is_active: true, order: 2 },
  { id: 'one_cash', name: 'ون كاش', account_number: '5555555555', account_name: 'Qor3a', is_active: true, order: 3 },
  { id: 'mobile_money', name: 'موبايل موني', account_number: '7777777777', account_name: 'Qor3a', is_active: false, order: 4 },
];

const getMethods = async () => {
  let accounts = DEFAULT_ACCOUNTS;

  try {
    const row = await db('settings').where({ key: 'payment_accounts' }).select('value').first();
    if (row && row.value && Array.isArray(row.value) && row.value.length > 0) {
      accounts = row.value.map((a, i) => ({
        id: a.method,
        name: a.method === 'kuraimi' ? 'كريمي' : a.method === 'jeeb' ? 'جيب' : a.method === 'one_cash' ? 'ون كاش' : 'موبايل موني',
        account_number: a.account_number,
        account_name: a.account_name,
        is_active: a.is_active,
        order: i + 1,
      }));
    }
  } catch {
    // settings table might not exist, use defaults
  }

  return accounts.filter((m) => m.is_active);
};

const listReceipts = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);

  const rows = await paymentModel.findReceipts({ status: query.status, page, limit });
  const totalResult = await paymentModel.countReceipts({ status: query.status });
  const total = parseInt(totalResult.total) || 0;

  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
};

module.exports = { getMethods, listReceipts };
