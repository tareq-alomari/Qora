const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  const existing = await knex('users').where('role', 'client').first();
  if (existing) {
    console.log('Demo data already exists, skipping...');
    return;
  }

  const hash = await bcrypt.hash('client123', 10);

  // ── Client users (11 users, one per order state) ──
  const clients = [
    { id: '00000000-0000-0000-0000-000000000010', phone: '967711111110', email: 'ahmed@example.com', full_name: 'أحمد محمد', role: 'client', is_verified: true, is_active: true },
    { id: '00000000-0000-0000-0000-000000000011', phone: '967711111111', email: 'sara@example.com', full_name: 'سارة علي', role: 'client', is_verified: true, is_active: true },
    { id: '00000000-0000-0000-0000-000000000012', phone: '967711111112', email: 'khaled@example.com', full_name: 'خالد عبدالله', role: 'client', is_verified: true, is_active: true },
    { id: '00000000-0000-0000-0000-000000000013', phone: '967711111113', email: 'noor@example.com', full_name: 'نور حسن', role: 'client', is_verified: true, is_active: true },
    { id: '00000000-0000-0000-0000-000000000014', phone: '967711111114', email: 'yasser@example.com', full_name: 'ياسر عمر', role: 'client', is_verified: false, is_active: true },
    { id: '00000000-0000-0000-0000-000000000015', phone: '967711111115', email: 'fatima@example.com', full_name: 'فاطمة أحمد', role: 'client', is_verified: true, is_active: true },
    { id: '00000000-0000-0000-0000-000000000016', phone: '967711111116', email: 'omar@example.com', full_name: 'عمر حسن', role: 'client', is_verified: true, is_active: true },
    { id: '00000000-0000-0000-0000-000000000017', phone: '967711111117', email: 'layla@example.com', full_name: 'ليلى محمد', role: 'client', is_verified: true, is_active: true },
    { id: '00000000-0000-0000-0000-000000000018', phone: '967711111118', email: 'hassan@example.com', full_name: 'حسن علي', role: 'client', is_verified: true, is_active: true },
    { id: '00000000-0000-0000-0000-000000000019', phone: '967711111119', email: 'amina@example.com', full_name: 'أمينة خالد', role: 'client', is_verified: true, is_active: true },
    { id: '00000000-0000-0000-0000-000000000020', phone: '967711111120', email: 'tareq@example.com', full_name: 'طارق ناصر', role: 'client', is_verified: true, is_active: true },
  ];
  await knex('users').insert(clients.map(c => ({ ...c, password_hash: hash })));

  // ── Orders (one per state, each for a different user) ──
  // The unique constraint idx_orders_user_active allows at most 1
  // active non-cancelled/non-completed order per user.
  const orders = [
    { id: '00000000-0000-0000-0000-000000000101', user_id: '00000000-0000-0000-0000-000000000010', status: 'draft',                total_price: 1000, order_number: 'QR-2026-0001', is_active: true },
    { id: '00000000-0000-0000-0000-000000000102', user_id: '00000000-0000-0000-0000-000000000015', status: 'data_entry_complete', total_price: 1000, order_number: 'QR-2026-0002', is_active: true },
    { id: '00000000-0000-0000-0000-000000000103', user_id: '00000000-0000-0000-0000-000000000011', status: 'photo_pending',       total_price: 1000, order_number: 'QR-2026-0003', is_active: true },
    { id: '00000000-0000-0000-0000-000000000104', user_id: '00000000-0000-0000-0000-000000000016', status: 'photo_accepted',      total_price: 1000, order_number: 'QR-2026-0004', is_active: true },
    { id: '00000000-0000-0000-0000-000000000105', user_id: '00000000-0000-0000-0000-000000000012', status: 'payment_pending',     total_price: 1000, order_number: 'QR-2026-0005', is_active: true },
    { id: '00000000-0000-0000-0000-000000000106', user_id: '00000000-0000-0000-0000-000000000017', status: 'payment_verification', total_price: 1000, order_number: 'QR-2026-0006', is_active: true },
    { id: '00000000-0000-0000-0000-000000000107', user_id: '00000000-0000-0000-0000-000000000018', status: 'approved',            total_price: 1000, order_number: 'QR-2026-0007', is_active: true },
    { id: '00000000-0000-0000-0000-000000000108', user_id: '00000000-0000-0000-0000-000000000013', status: 'submitted',           total_price: 1000, order_number: 'QR-2026-0008', is_active: true, metadata: JSON.stringify({ confirmation_number: '2026AB1234567' }) },
    { id: '00000000-0000-0000-0000-000000000109', user_id: '00000000-0000-0000-0000-000000000014', status: 'completed',           total_price: 1000, order_number: 'QR-2026-0009', is_active: true, metadata: JSON.stringify({ confirmation_number: '2026CD7654321' }) },
    { id: '00000000-0000-0000-0000-000000000110', user_id: '00000000-0000-0000-0000-000000000019', status: 'cancelled',           total_price: 1000, order_number: 'QR-2026-0010', is_active: false },
    { id: '00000000-0000-0000-0000-000000000111', user_id: '00000000-0000-0000-0000-000000000020', status: 'needs_correction',    total_price: 1000, order_number: 'QR-2026-0011', is_active: true },
    { id: '00000000-0000-0000-0000-000000000112', user_id: '00000000-0000-0000-0000-000000000010', status: 'photo_rejected',      total_price: 1000, order_number: 'QR-2026-0012', is_active: false },
  ];
  await knex('orders').insert(orders);

  // ── Inactive/extra orders for richer demo ──
  // Ahmed gets an extra cancelled order (already handled above).
  // Sara gets an extra needs_correction (inactive) as history.
  await knex('orders').insert([
    { id: '00000000-0000-0000-0000-000000000113', user_id: '00000000-0000-0000-0000-000000000011', status: 'needs_correction', total_price: 1000, order_number: 'QR-2026-0013', is_active: false },
  ]);

  // ── Applicant data for non-draft orders ──
  const applicantData = [
    {
      id: '00000000-0000-0000-0000-000000000201', order_id: '00000000-0000-0000-0000-000000000102',
      first_name: 'فاطمة', middle_name: 'أحمد', last_name: 'علي', gender: 'female',
      birth_date: '1992-03-10', birth_country: 'Yemen', birth_city: 'صنعاء',
      email: 'fatima@example.com', phone: '967711111115',
      address_line1: 'شارع حدة', country: 'Yemen', city: 'صنعاء',
      education_level: 'Bachelor\'s Degree', marital_status: 'married',
      country_of_eligibility: 'YEMEN',
    },
    {
      id: '00000000-0000-0000-0000-000000000202', order_id: '00000000-0000-0000-0000-000000000103',
      first_name: 'سارة', middle_name: '', last_name: 'علي', gender: 'female',
      birth_date: '1995-08-22', birth_country: 'Yemen', birth_city: 'عدن',
      email: 'sara@example.com', phone: '967711111111',
      country: 'Yemen', city: 'عدن',
      education_level: 'Master\'s Degree', marital_status: 'single',
      country_of_eligibility: 'YEMEN',
    },
    {
      id: '00000000-0000-0000-0000-000000000203', order_id: '00000000-0000-0000-0000-000000000104',
      first_name: 'عمر', middle_name: '', last_name: 'حسن', gender: 'male',
      birth_date: '1991-11-05', birth_country: 'Yemen', birth_city: 'تعز',
      email: 'omar@example.com', phone: '967711111116',
      country: 'Yemen', city: 'تعز',
      education_level: "Bachelor's Degree", marital_status: 'single',
      country_of_eligibility: 'YEMEN',
      photo_path: '/uploads/demo/omar-photo.jpg',
      photo_validation: JSON.stringify({ checks: { face_center: true, lighting: true, background: true, sharpness: true }, score: 0.92, passed: true }),
    },
    {
      id: '00000000-0000-0000-0000-000000000204', order_id: '00000000-0000-0000-0000-000000000105',
      first_name: 'خالد', middle_name: 'عبدالله', last_name: 'حسين', gender: 'male',
      birth_date: '1988-12-01', birth_country: 'Yemen', birth_city: 'تعز',
      email: 'khaled@example.com', phone: '967711111112',
      country: 'Yemen', city: 'تعز',
      education_level: 'Bachelor\'s Degree', marital_status: 'married',
      spouse_data: JSON.stringify({ full_name: 'فاطمة أحمد', birth_date: '1992-03-10' }),
      children_data: JSON.stringify([{ full_name: 'مريم خالد', birth_date: '2018-06-20' }, { full_name: 'عمر خالد', birth_date: '2020-11-15' }]),
      country_of_eligibility: 'YEMEN',
      photo_path: '/uploads/demo/khaled-photo.jpg',
      photo_validation: JSON.stringify({ checks: { face_center: true, lighting: true, background: true, sharpness: true }, score: 0.88, passed: true }),
    },
    {
      id: '00000000-0000-0000-0000-000000000205', order_id: '00000000-0000-0000-0000-000000000106',
      first_name: 'ليلى', middle_name: '', last_name: 'محمد', gender: 'female',
      birth_date: '1994-07-14', birth_country: 'Yemen', birth_city: 'إب',
      email: 'layla@example.com', phone: '967711111117',
      country: 'Yemen', city: 'إب',
      education_level: "Bachelor's Degree", marital_status: 'single',
      country_of_eligibility: 'YEMEN',
      photo_path: '/uploads/demo/layla-photo.jpg',
      photo_validation: JSON.stringify({ checks: { face_center: true, lighting: true, background: true, sharpness: true }, score: 0.91, passed: true }),
    },
    {
      id: '00000000-0000-0000-0000-000000000206', order_id: '00000000-0000-0000-0000-000000000107',
      first_name: 'حسن', middle_name: '', last_name: 'علي', gender: 'male',
      birth_date: '1990-02-28', birth_country: 'Yemen', birth_city: 'الحديدة',
      email: 'hassan@example.com', phone: '967711111118',
      country: 'Yemen', city: 'الحديدة',
      education_level: 'High School', marital_status: 'married',
      spouse_data: JSON.stringify({ full_name: 'أمينة محمد', birth_date: '1993-06-15' }),
      country_of_eligibility: 'YEMEN',
      photo_path: '/uploads/demo/hassan-photo.jpg',
      photo_validation: JSON.stringify({ checks: { face_center: true, lighting: true, background: true, sharpness: true }, score: 0.87, passed: true }),
    },
    {
      id: '00000000-0000-0000-0000-000000000207', order_id: '00000000-0000-0000-0000-000000000108',
      first_name: 'نور', middle_name: '', last_name: 'حسن', gender: 'female',
      birth_date: '1993-04-18', birth_country: 'Yemen', birth_city: 'إب',
      email: 'noor@example.com', phone: '967711111113',
      country: 'Yemen', city: 'إب',
      education_level: 'High School', marital_status: 'single',
      country_of_eligibility: 'YEMEN',
      photo_path: '/uploads/demo/noor-photo.jpg',
      photo_validation: JSON.stringify({ checks: { face_center: true, lighting: true, background: true, sharpness: true }, score: 0.95, passed: true }),
      confirmation_number: '2026AB1234567',
    },
    {
      id: '00000000-0000-0000-0000-000000000208', order_id: '00000000-0000-0000-0000-000000000109',
      first_name: 'ياسر', middle_name: 'عمر', last_name: 'أحمد', gender: 'male',
      birth_date: '1985-09-30', birth_country: 'Yemen', birth_city: 'الحديدة',
      email: 'yasser@example.com', phone: '967711111114',
      country: 'Yemen', city: 'الحديدة',
      education_level: 'Bachelor\'s Degree', marital_status: 'married',
      spouse_data: JSON.stringify({ full_name: 'هدى ياسر', birth_date: '1990-07-25' }),
      country_of_eligibility: 'YEMEN',
      photo_path: '/uploads/demo/yasser-photo.jpg',
      photo_validation: JSON.stringify({ checks: { face_center: true, lighting: true, background: true, sharpness: true }, score: 0.91, passed: true }),
      confirmation_number: '2026CD7654321',
    },
    {
      id: '00000000-0000-0000-0000-000000000209', order_id: '00000000-0000-0000-0000-000000000111',
      first_name: 'طارق', middle_name: '', last_name: 'ناصر', gender: 'male',
      birth_date: '1987-09-05', birth_country: 'Yemen', birth_city: 'صعدة',
      email: 'tareq@example.com', phone: '967711111120',
      country: 'Yemen', city: 'صعدة',
      education_level: "Bachelor's Degree", marital_status: 'single',
      country_of_eligibility: 'YEMEN',
    },
    {
      id: '00000000-0000-0000-0000-000000000210', order_id: '00000000-0000-0000-0000-000000000112',
      first_name: 'أحمد', middle_name: 'محمد', last_name: 'علي', gender: 'male',
      birth_date: '1990-05-15', birth_country: 'Yemen', birth_city: 'صنعاء',
      email: 'ahmed@example.com', phone: '967711111110',
      address_line1: 'شارع حدة', country: 'Yemen', city: 'صنعاء',
      education_level: 'Bachelor\'s Degree', marital_status: 'married',
      country_of_eligibility: 'YEMEN',
      photo_path: '/uploads/demo/ahmed-rejected-photo.jpg',
      photo_validation: JSON.stringify({ checks: { face_center: false, lighting: true, background: false, sharpness: true }, score: 0.35, passed: false, reason: 'الخلفية غير بيضاء والوجه غير في المنتصف' }),
    },
  ];
  await knex('applicant_data').insert(applicantData);

  // ── Payments ──
  const payments = [
    { id: '00000000-0000-0000-0000-000000000301', order_id: '00000000-0000-0000-0000-000000000105', amount: 1000, method: 'deposit', provider: 'kuraimi', transfer_number: 'TRF-2026-001', status: 'pending' },
    { id: '00000000-0000-0000-0000-000000000302', order_id: '00000000-0000-0000-0000-000000000106', amount: 1000, method: 'deposit', provider: 'jeeb', transfer_number: 'TRF-2026-002', receipt_image_path: '/uploads/demo/receipt-jeeb.jpg', status: 'pending' },
    { id: '00000000-0000-0000-0000-000000000303', order_id: '00000000-0000-0000-0000-000000000107', amount: 1000, method: 'wallet', provider: 'one_cash', transfer_number: 'TRF-2026-003', receipt_image_path: '/uploads/demo/receipt-onecash.jpg', status: 'verified', verified_by: '00000000-0000-0000-0000-000000000002', verified_at: knex.fn.now() },
    { id: '00000000-0000-0000-0000-000000000304', order_id: '00000000-0000-0000-0000-000000000108', amount: 1000, method: 'deposit', provider: 'kuraimi', transfer_number: 'TRF-2026-004', receipt_image_path: '/uploads/demo/receipt-kuraimi.jpg', status: 'verified', verified_by: '00000000-0000-0000-0000-000000000002', verified_at: knex.fn.now() },
    { id: '00000000-0000-0000-0000-000000000305', order_id: '00000000-0000-0000-0000-000000000109', amount: 1000, method: 'deposit', provider: 'mobile_money', transfer_number: 'TRF-2026-005', status: 'verified', verified_by: '00000000-0000-0000-0000-000000000002', verified_at: knex.fn.now() },
  ];
  await knex('payments').insert(payments);

  // ── Audit logs ──
  const auditLogs = [
    { order_id: '00000000-0000-0000-0000-000000000102', user_id: '00000000-0000-0000-0000-000000000015', action: 'data_entry_complete', from_status: 'draft', to_status: 'data_entry_complete', metadata: JSON.stringify({ source: 'client_wizard' }) },
    { order_id: '00000000-0000-0000-0000-000000000103', user_id: '00000000-0000-0000-0000-000000000011', action: 'data_entry_complete', from_status: 'draft', to_status: 'data_entry_complete' },
    { order_id: '00000000-0000-0000-0000-000000000103', user_id: '00000000-0000-0000-0000-000000000011', action: 'upload_photo', from_status: 'data_entry_complete', to_status: 'photo_pending' },
    { order_id: '00000000-0000-0000-0000-000000000104', user_id: '00000000-0000-0000-0000-000000000016', action: 'data_entry_complete', from_status: 'draft', to_status: 'data_entry_complete' },
    { order_id: '00000000-0000-0000-0000-000000000104', user_id: '00000000-0000-0000-0000-000000000016', action: 'upload_photo', from_status: 'data_entry_complete', to_status: 'photo_pending' },
    { order_id: '00000000-0000-0000-0000-000000000104', user_id: '00000000-0000-0000-0000-000000000001', action: 'approve_photo', from_status: 'photo_pending', to_status: 'photo_accepted' },
    { order_id: '00000000-0000-0000-0000-000000000105', user_id: '00000000-0000-0000-0000-000000000012', action: 'data_entry_complete', from_status: 'draft', to_status: 'data_entry_complete' },
    { order_id: '00000000-0000-0000-0000-000000000105', user_id: '00000000-0000-0000-0000-000000000012', action: 'upload_photo', from_status: 'data_entry_complete', to_status: 'photo_pending' },
    { order_id: '00000000-0000-0000-0000-000000000105', user_id: '00000000-0000-0000-0000-000000000001', action: 'approve_photo', from_status: 'photo_pending', to_status: 'photo_accepted' },
    { order_id: '00000000-0000-0000-0000-000000000105', user_id: '00000000-0000-0000-0000-000000000012', action: 'upload_receipt', from_status: 'photo_accepted', to_status: 'payment_pending' },
    { order_id: '00000000-0000-0000-0000-000000000106', user_id: '00000000-0000-0000-0000-000000000017', action: 'upload_receipt', from_status: 'payment_pending', to_status: 'payment_verification' },
    { order_id: '00000000-0000-0000-0000-000000000107', user_id: '00000000-0000-0000-0000-000000000002', action: 'verify_payment', from_status: 'payment_verification', to_status: 'approved' },
    { order_id: '00000000-0000-0000-0000-000000000108', user_id: '00000000-0000-0000-0000-000000000013', action: 'data_entry_complete', from_status: 'draft', to_status: 'data_entry_complete' },
    { order_id: '00000000-0000-0000-0000-000000000108', user_id: '00000000-0000-0000-0000-000000000013', action: 'upload_photo', from_status: 'data_entry_complete', to_status: 'photo_pending' },
    { order_id: '00000000-0000-0000-0000-000000000108', user_id: '00000000-0000-0000-0000-000000000001', action: 'approve_photo', from_status: 'photo_pending', to_status: 'photo_accepted' },
    { order_id: '00000000-0000-0000-0000-000000000108', user_id: '00000000-0000-0000-0000-000000000013', action: 'upload_receipt', from_status: 'photo_accepted', to_status: 'payment_pending' },
    { order_id: '00000000-0000-0000-0000-000000000108', user_id: '00000000-0000-0000-0000-000000000002', action: 'verify_payment', from_status: 'payment_verification', to_status: 'approved' },
    { order_id: '00000000-0000-0000-0000-000000000108', user_id: '00000000-0000-0000-0000-000000000001', action: 'submit_official', from_status: 'approved', to_status: 'submitted', metadata: JSON.stringify({ confirmation_number: '2026AB1234567' }) },
    { order_id: '00000000-0000-0000-0000-000000000109', user_id: '00000000-0000-0000-0000-000000000014', action: 'data_entry_complete', from_status: 'draft', to_status: 'data_entry_complete' },
    { order_id: '00000000-0000-0000-0000-000000000109', user_id: '00000000-0000-0000-0000-000000000014', action: 'upload_photo', from_status: 'data_entry_complete', to_status: 'photo_pending' },
    { order_id: '00000000-0000-0000-0000-000000000109', user_id: '00000000-0000-0000-0000-000000000001', action: 'approve_photo', from_status: 'photo_pending', to_status: 'photo_accepted' },
    { order_id: '00000000-0000-0000-0000-000000000109', user_id: '00000000-0000-0000-0000-000000000014', action: 'upload_receipt', from_status: 'photo_accepted', to_status: 'payment_pending' },
    { order_id: '00000000-0000-0000-0000-000000000109', user_id: '00000000-0000-0000-0000-000000000002', action: 'verify_payment', from_status: 'payment_verification', to_status: 'approved' },
    { order_id: '00000000-0000-0000-0000-000000000109', user_id: '00000000-0000-0000-0000-000000000001', action: 'submit_official', from_status: 'approved', to_status: 'submitted', metadata: JSON.stringify({ confirmation_number: '2026CD7654321' }) },
    { order_id: '00000000-0000-0000-0000-000000000109', user_id: '00000000-0000-0000-0000-000000000001', action: 'check_result', from_status: 'submitted', to_status: 'completed', metadata: JSON.stringify({ result: 'not_selected' }) },
    { order_id: '00000000-0000-0000-0000-000000000110', user_id: '00000000-0000-0000-0000-000000000001', action: 'cancel', from_status: 'draft', to_status: 'cancelled' },
    { order_id: '00000000-0000-0000-0000-000000000111', user_id: '00000000-0000-0000-0000-000000000001', action: 'needs_correction', from_status: 'data_entry_complete', to_status: 'needs_correction', metadata: JSON.stringify({ notes: 'يرجى تحديث معلومات جواز السفر' }) },
    { order_id: '00000000-0000-0000-0000-000000000112', user_id: '00000000-0000-0000-0000-000000000001', action: 'reject_photo', from_status: 'photo_pending', to_status: 'photo_rejected', metadata: JSON.stringify({ reason: 'الخلفية غير بيضاء' }) },
    { order_id: '00000000-0000-0000-0000-000000000113', user_id: '00000000-0000-0000-0000-000000000001', action: 'needs_correction', from_status: 'data_entry_complete', to_status: 'needs_correction', metadata: JSON.stringify({ notes: 'يرجى إعادة رفع الصورة' }) },
  ];
  await knex('audit_logs').insert(auditLogs.map(l => ({ ...l, ip_address: '127.0.0.1', created_at: knex.fn.now() })));

  // ── Notifications ──
  const notifications = [
    { user_id: '00000000-0000-0000-0000-000000000016', order_id: '00000000-0000-0000-0000-000000000104', type: 'photo_accepted', channel: 'pwa', title: 'تم قبول الصورة', body: 'تم قبول صورتك الشخصية. يرجى إتمام عملية الدفع.', status: 'sent', sent_at: knex.fn.now() },
    { user_id: '00000000-0000-0000-0000-000000000018', order_id: '00000000-0000-0000-0000-000000000107', type: 'payment_verified', channel: 'pwa', title: 'تم تأكيد الدفع', body: 'تم تأكيد استلام الدفع. سيتم التقديم قريباً.', status: 'sent', sent_at: knex.fn.now() },
    { user_id: '00000000-0000-0000-0000-000000000013', order_id: '00000000-0000-0000-0000-000000000108', type: 'submitted', channel: 'pwa', title: 'تم التقديم', body: 'تم تقديم طلبك بنجاح! رقم التأكيد: 2026AB1234567', status: 'sent', sent_at: knex.fn.now() },
    { user_id: '00000000-0000-0000-0000-000000000014', order_id: '00000000-0000-0000-0000-000000000109', type: 'result_available', channel: 'pwa', title: 'النتيجة متاحة', body: 'يمكنك الآن الاطلاع على نتيجة قرعة اللوتري الخاصة بك.', status: 'sent', sent_at: knex.fn.now() },
    { user_id: '00000000-0000-0000-0000-000000000010', order_id: '00000000-0000-0000-0000-000000000112', type: 'photo_rejected', channel: 'pwa', title: 'الصورة مرفوضة', body: 'لم يتم قبول الصورة. يرجى رفع صورة جديدة بخلفية بيضاء.', status: 'sent', sent_at: knex.fn.now() },
  ];
  await knex('notifications').insert(notifications);

  console.log(`Demo data: ${clients.length} clients, ${orders.length + 1} orders`);
};
