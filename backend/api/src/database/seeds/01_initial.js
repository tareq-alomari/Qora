const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  await knex('settings').del();
  await knex('audit_logs').del();
  await knex('notifications').del();
  await knex('payments').del();
  await knex('applicant_data').del();
  await knex('orders').del();
  await knex('users').del();

  const hash = await bcrypt.hash('admin123', 10);

  await knex('users').insert([
    {
      id: '00000000-0000-0000-0000-000000000001',
      phone: '967700000001',
      email: 'admin@qor3a.ye',
      password_hash: hash,
      full_name: 'مدير النظام',
      role: 'admin',
      is_verified: true,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      phone: '967700000002',
      email: 'employee@qor3a.ye',
      password_hash: hash,
      full_name: 'موظف قرعة',
      role: 'employee',
      is_verified: true,
      is_active: true,
    },
  ]);

  await knex('settings').insert([
    {
      key: 'pricing',
      value: JSON.stringify({ lottery_registration: 1000, result_checking: 0 }),
    },
    {
      key: 'payment_accounts',
      value: JSON.stringify([
        { method: 'kuraimi', account_number: '0123456789', account_name: 'Qor3a Yemen', is_active: true },
        { method: 'jeeb', account_number: '9876543210', account_name: 'Qor3a Yemen', is_active: true },
        { method: 'one_cash', account_number: '5555555555', account_name: 'Qor3a', is_active: true },
        { method: 'mobile_money', account_number: '7777777777', account_name: 'Qor3a', is_active: false },
      ]),
    },
    {
      key: 'season',
      value: JSON.stringify({ is_open: true, opens_at: '2026-09-01T08:00:00Z', closes_at: '2026-10-31T23:59:59Z' }),
    },
  ]);
};
