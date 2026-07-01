const { canTransition, getNextStates, assertTransition, TRANSITIONS, ACTIONS } = require('../../src/common/state-machine');
const { AppError } = require('../../src/common/error-handler');

describe('State Machine', () => {
  describe('canTransition', () => {
    test('allows valid transitions', () => {
      expect(canTransition('draft', 'data_entry_complete')).toBe(true);
      expect(canTransition('photo_pending', 'photo_accepted')).toBe(true);
      expect(canTransition('payment_verification', 'approved')).toBe(true);
    });

    test('blocks invalid transitions', () => {
      expect(canTransition('draft', 'completed')).toBe(false);
      expect(canTransition('approved', 'draft')).toBe(false);
      expect(canTransition('photo_accepted', 'photo_rejected')).toBe(false);
    });

    test('cancel is always allowed', () => {
      expect(canTransition('draft', 'cancelled')).toBe(true);
      expect(canTransition('approved', 'cancelled')).toBe(true);
      expect(canTransition('completed', 'cancelled')).toBe(true);
    });

    test('terminal states have no outgoing transitions', () => {
      expect(TRANSITIONS.completed).toEqual([]);
      expect(TRANSITIONS.cancelled).toEqual([]);
    });
  });

  describe('getNextStates', () => {
    test('returns correct next states for draft', () => {
      expect(getNextStates('draft')).toEqual(['data_entry_complete']);
    });

    test('returns correct next states for data_entry_complete', () => {
      expect(getNextStates('data_entry_complete')).toEqual(['photo_pending', 'draft']);
    });

    test('returns correct next states for photo_pending', () => {
      expect(getNextStates('photo_pending')).toEqual(['photo_accepted', 'photo_rejected']);
    });
  });

  describe('assertTransition', () => {
    test('allows employee to accept photo', () => {
      const action = assertTransition('photo_pending', 'photo_accepted', 'employee');
      expect(action).toBe('approve_photo');
    });

    test('allows client to submit data', () => {
      const action = assertTransition('draft', 'data_entry_complete', 'client');
      expect(action).toBe('submit_data');
    });

    test('allows client to edit data', () => {
      const action = assertTransition('data_entry_complete', 'draft', 'client');
      expect(action).toBe('edit_data');
    });

    test('blocks client from approving order', () => {
      expect(() => {
        assertTransition('payment_verification', 'approved', 'client');
      }).toThrow(AppError);
    });

    test('allows admin to cancel', () => {
      const action = assertTransition('draft', 'cancelled', 'admin');
      expect(action).toBe('cancel');
    });

    test('blocks non-admin from cancelling', () => {
      expect(() => {
        assertTransition('draft', 'cancelled', 'client');
      }).toThrow(AppError);
    });

    test('blocks invalid transitions', () => {
      expect(() => {
        assertTransition('draft', 'completed', 'admin');
      }).toThrow(AppError);
    });
  });

  describe('ACTIONS', () => {
    test('every action has valid from/to states', () => {
      Object.entries(ACTIONS).forEach(([name, { from, to }]) => {
        if (from !== null) {
          expect(TRANSITIONS[from]).toContain(to);
        }
      });
    });
  });
});
