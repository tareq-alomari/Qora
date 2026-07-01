const { AppError } = require('./error-handler');

const TRANSITIONS = {
  draft: ['data_entry_complete'],
  data_entry_complete: ['photo_pending'],
  photo_pending: ['photo_accepted', 'photo_rejected'],
  photo_rejected: ['photo_pending'],
  photo_accepted: ['payment_pending'],
  payment_pending: ['payment_verification'],
  payment_verification: ['approved', 'needs_correction'],
  needs_correction: ['payment_pending', 'photo_pending', 'data_entry_complete'],
  approved: ['submitted'],
  submitted: ['completed'],
  completed: [],
  cancelled: [],
};

const ACTIONS = {
  submit_data: { from: 'draft', to: 'data_entry_complete' },
  upload_photo: { from: 'data_entry_complete', to: 'photo_pending' },
  reject_photo: { from: 'photo_pending', to: 'photo_rejected' },
  retry_photo: { from: 'photo_rejected', to: 'photo_pending' },
  accept_photo: { from: 'photo_pending', to: 'photo_accepted' },
  initiate_payment: { from: 'photo_accepted', to: 'payment_pending' },
  verify_payment: { from: 'payment_pending', to: 'payment_verification' },
  approve: { from: 'payment_verification', to: 'approved' },
  request_correction: { from: null, to: 'needs_correction' },
  resubmit_data: { from: 'needs_correction', to: 'data_entry_complete' },
  resubmit_photo: { from: 'needs_correction', to: 'photo_pending' },
  retry_payment: { from: 'needs_correction', to: 'payment_pending' },
  submit_official: { from: 'approved', to: 'submitted' },
  mark_completed: { from: 'submitted', to: 'completed' },
  cancel: { from: null, to: 'cancelled' },
};

const ROLE_ACTIONS = {
  client: ['submit_data', 'upload_photo', 'retry_photo', 'initiate_payment', 'resubmit_data', 'resubmit_photo', 'retry_payment'],
  employee: ['reject_photo', 'accept_photo', 'verify_payment', 'approve', 'request_correction', 'submit_official'],
  admin: ['reject_photo', 'accept_photo', 'verify_payment', 'approve', 'request_correction', 'submit_official', 'cancel', 'mark_completed'],
};

const GUARDS = {
  submit_data: async (order) => {
    const applicant = await require('../database/db')('applicant_data').where({ order_id: order.id }).first();
    if (!applicant || !applicant.first_name || !applicant.last_name) {
      throw new AppError('Personal data is required before submitting', 400, 'MISSING_DATA');
    }
    return true;
  },
  accept_photo: async (order) => {
    const applicant = await require('../database/db')('applicant_data').where({ order_id: order.id }).first();
    if (!applicant || !applicant.photo_path) {
      throw new AppError('Photo must be uploaded before acceptance', 400, 'MISSING_DATA');
    }
    return true;
  },
  verify_payment: async (order) => {
    const payment = await require('../database/db')('payments').where({ order_id: order.id }).first();
    if (!payment || !payment.receipt_image_path) {
      throw new AppError('Payment receipt must be uploaded before verification', 400, 'MISSING_DATA');
    }
    return true;
  },
};

const canTransition = (fromStatus, toStatus) => {
  if (toStatus === 'cancelled') return true;
  if (toStatus === 'needs_correction') return true;
  const allowed = TRANSITIONS[fromStatus];
  return allowed && allowed.includes(toStatus);
};

const getNextStates = (status) => {
  return TRANSITIONS[status] || [];
};

const getActionForTransition = (fromStatus, toStatus) => {
  for (const [action, transition] of Object.entries(ACTIONS)) {
    if (transition.from === fromStatus && transition.to === toStatus) {
      return action;
    }
    if (toStatus === 'cancelled' && action === 'cancel') {
      return 'cancel';
    }
    if (toStatus === 'needs_correction' && action === 'request_correction') {
      return 'request_correction';
    }
  }
  return null;
};

const assertTransition = (fromStatus, toStatus, role) => {
  if (!canTransition(fromStatus, toStatus)) {
    throw new AppError(
      `Cannot transition from ${fromStatus} to ${toStatus}`,
      409,
      'INVALID_TRANSITION',
    );
  }

  const action = getActionForTransition(fromStatus, toStatus);
  if (!action) {
    throw new AppError(
      `No action maps from ${fromStatus} to ${toStatus}`,
      409,
      'INVALID_TRANSITION',
    );
  }

  const allowedRoles = Object.entries(ROLE_ACTIONS)
    .filter(([_, actions]) => actions.includes(action))
    .map(([roleName]) => roleName);

  if (!allowedRoles.includes(role)) {
    throw new AppError(
      `Role ${role} cannot perform action ${action}`,
      403,
      'FORBIDDEN',
    );
  }

  return action;
};

const checkGuard = async (action, order) => {
  const guard = GUARDS[action];
  if (guard) {
    await guard(order);
  }
};

module.exports = {
  TRANSITIONS,
  ACTIONS,
  ROLE_ACTIONS,
  GUARDS,
  canTransition,
  getNextStates,
  getActionForTransition,
  assertTransition,
  checkGuard,
};
