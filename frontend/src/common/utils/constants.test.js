import { describe, test, expect } from 'vitest'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  EDUCATION_LEVELS,
  MARITAL_STATUSES,
  GENDERS,
  PAYMENT_STATUS_LABELS,
  METHOD_LABELS,
  ROLE_LABELS,
  ACTION_LABELS,
  RESULT_LABELS,
  DEFAULT_PAGE_SIZE,
} from './constants'

describe('Constants', () => {
  test('STATUS_LABELS has all 12 states', () => {
    const states = Object.keys(STATUS_LABELS)
    expect(states).toHaveLength(12)
    expect(states).toContain('draft')
    expect(states).toContain('data_entry_complete')
    expect(states).toContain('photo_pending')
    expect(states).toContain('photo_accepted')
    expect(states).toContain('photo_rejected')
    expect(states).toContain('payment_pending')
    expect(states).toContain('payment_verification')
    expect(states).toContain('approved')
    expect(states).toContain('needs_correction')
    expect(states).toContain('submitted')
    expect(states).toContain('completed')
    expect(states).toContain('cancelled')
  })

  test('STATUS_COLORS has colors for all states', () => {
    const states = Object.keys(STATUS_LABELS)
    states.forEach((state) => {
      expect(STATUS_COLORS[state]).toBeDefined()
      expect(typeof STATUS_COLORS[state]).toBe('string')
    })
  })

  test('EDUCATION_LEVELS has 10 levels', () => {
    expect(EDUCATION_LEVELS).toHaveLength(10)
    expect(EDUCATION_LEVELS[0].value).toBe(1)
    expect(EDUCATION_LEVELS[0].label).toBeDefined()
  })

  test('MARITAL_STATUSES has all statuses', () => {
    const values = MARITAL_STATUSES.map((s) => s.value)
    expect(values).toContain('single')
    expect(values).toContain('married')
    expect(values).toContain('married_usc_lpr')
    expect(values).toContain('divorced')
    expect(values).toContain('widowed')
    expect(values).toContain('legally_separated')
  })

  test('PAYMENT_STATUS_LABELS has pending, verified, rejected', () => {
    expect(PAYMENT_STATUS_LABELS.pending).toBeDefined()
    expect(PAYMENT_STATUS_LABELS.verified).toBeDefined()
    expect(PAYMENT_STATUS_LABELS.rejected).toBeDefined()
  })

  test('GENDERS has male and female', () => {
    const values = GENDERS.map((g) => g.value)
    expect(values).toContain('male')
    expect(values).toContain('female')
  })

  test('ROLE_LABELS has admin, employee, client', () => {
    expect(ROLE_LABELS.admin).toBeDefined()
    expect(ROLE_LABELS.employee).toBeDefined()
    expect(ROLE_LABELS.client).toBeDefined()
  })

  test('ACTION_LABELS has all actions', () => {
    expect(ACTION_LABELS.approve_photo).toBeDefined()
    expect(ACTION_LABELS.verify_payment).toBeDefined()
    expect(ACTION_LABELS.submit_official).toBeDefined()
    expect(ACTION_LABELS.cancel).toBeDefined()
  })

  test('RESULT_LABELS has winner, loser, pending', () => {
    expect(RESULT_LABELS.winner).toBeDefined()
    expect(RESULT_LABELS.loser).toBeDefined()
    expect(RESULT_LABELS.pending).toBeDefined()
  })

  test('DEFAULT_PAGE_SIZE is 20', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20)
  })

  test('METHOD_LABELS has mobile_money', () => {
    expect(METHOD_LABELS.mobile_money).toBeDefined()
  })
})
