const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizePhoneNumber,
  validateTransaction,
} = require('../src/validators/transactionValidator');

test('accepts local Ghana number', () => {
  assert.equal(normalizePhoneNumber('0241234567'), '0241234567');
});

test('accepts and normalizes international Ghana number', () => {
  assert.equal(normalizePhoneNumber('233241234567'), '0241234567');
});

test('rejects invalid Ghana number', () => {
  assert.equal(normalizePhoneNumber('12345'), null);
});

test('rejects invalid amount', () => {
  const result = validateTransaction({
    phone_number: '0241234567',
    amount: '-5',
    network: 'MTN',
  });

  assert.equal(result.valid, false);
  assert.equal(result.reason, 'invalid amount');
});
