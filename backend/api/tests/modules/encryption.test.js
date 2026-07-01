const crypto = require('crypto');
const { encrypt, decrypt, encryptBuffer, decryptBuffer, clearKeyCache } = require('../../src/common/encryption');

const TEST_KEY = 'test-encryption-key-32chars!';

describe('Encryption Utility', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY;
    clearKeyCache();
  });

  afterAll(() => {
    clearKeyCache();
  });

  describe('text/json encryption', () => {
    test('encrypts and decrypts a string', () => {
      const original = 'passport12345';
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    test('encrypts and decrypts an object', () => {
      const original = { name: 'John', passport: 'AB123456' };
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toEqual(original);
    });

    test('encrypts and decrypts an array', () => {
      const original = [{ name: 'Child1' }, { name: 'Child2' }];
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toEqual(original);
    });

    test('produces different ciphertexts for same input', () => {
      const input = 'same-value';
      const e1 = encrypt(input);
      const e2 = encrypt(input);
      expect(e1).not.toBe(e2);
    });

    test('returns null for null/undefined input', () => {
      expect(encrypt(null)).toBeNull();
      expect(encrypt(undefined)).toBeNull();
    });

    test('returns null for invalid ciphertext', () => {
      expect(decrypt('invalid')).toBeNull();
      expect(decrypt('')).toBeNull();
      expect(decrypt(null)).toBeNull();
    });

    test('detects tampered ciphertext', () => {
      const encrypted = encrypt('secret-data');
      const parts = encrypted.split(':');
      parts[1] = '00000000000000000000000000000000';
      const tampered = parts.join(':');
      expect(decrypt(tampered)).toBeNull();
    });

    test('handles Arabic text', () => {
      const original = 'رقم الجواز: 123456';
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    test('handles nested objects', () => {
      const original = {
        spouse: { name: 'Fatima', passport: 'CD789012', birth_date: '1990-05-15' },
        children: [
          { name: 'Ahmed', birth_date: '2015-03-20' },
          { name: 'Sara', birth_date: '2018-11-08' },
        ],
      };
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toEqual(original);
    });
  });

  describe('buffer encryption', () => {
    test('encrypts and decrypts a buffer', () => {
      const original = Buffer.from('test-file-content');
      const encrypted = encryptBuffer(original);
      const decrypted = decryptBuffer(encrypted);
      expect(decrypted.equals(original)).toBe(true);
    });

    test('handles empty buffer', () => {
      const original = Buffer.alloc(0);
      const encrypted = encryptBuffer(original);
      const decrypted = decryptBuffer(encrypted);
      expect(decrypted.equals(original)).toBe(true);
    });

    test('produces different output for same input', () => {
      const input = Buffer.from('photo-content');
      const e1 = encryptBuffer(input);
      const e2 = encryptBuffer(input);
      expect(e1.equals(e2)).toBe(false);
    });

    test('handles JPEG-size buffer', () => {
      const original = crypto.randomBytes(65536);
      const encrypted = encryptBuffer(original);
      const decrypted = decryptBuffer(encrypted);
      expect(decrypted.equals(original)).toBe(true);
    });

    test('returns null for tampered buffer', () => {
      const original = Buffer.from('secret');
      const encrypted = encryptBuffer(original);
      encrypted[10] = 0xFF;
      encrypted[11] = 0xFF;
      expect(decryptBuffer(encrypted)).toBeNull();
    });
  });

  describe('key management', () => {
    test('throws without ENCRYPTION_KEY', () => {
      const prev = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;
      clearKeyCache();
      expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY');
      process.env.ENCRYPTION_KEY = prev;
      clearKeyCache();
    });
  });
});
