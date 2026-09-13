const test = require('node:test');
const assert = require('node:assert/strict');
const { processTransactions } = require('../src/services/transactionService');
const { resetWallet, getWalletBalance } = require('../src/storage/walletStore');

test.beforeEach(() => {
  resetWallet(100);
});

test('processes transactions sequentially and preserves balance on failures', () => {
  const rows = [
    { phone_number: '0241111111', amount: '40', network: 'MTN' },
    { phone_number: '0202222222', amount: '50', network: 'Telecel' },
    { phone_number: '0273333333', amount: '30', network: 'AT' },
    { phone_number: '0244444444', amount: '10', network: 'MTN' },
  ];

  const result = processTransactions(rows);

  assert.equal(result.summary.successful, 3);
  assert.equal(result.summary.failed, 1);
  assert.equal(result.failedTransactions[0].reason, 'insufficient balance');
  assert.equal(result.summary.finalBalance, 0);
  assert.equal(getWalletBalance(), 0);
});

test('rejects duplicate transaction within the batch', () => {
  const rows = [
    { phone_number: '0241234567', amount: '10', network: 'MTN' },
    { phone_number: '233241234567', amount: '10', network: 'MTN' },
  ];

  const result = processTransactions(rows);

  assert.equal(result.summary.successful, 1);
  assert.equal(result.summary.failed, 1);
  assert.equal(result.failedTransactions[0].reason, 'duplicate transaction');
  assert.equal(result.summary.finalBalance, 90);
});

test('invalid transaction does not change wallet balance', () => {
  const rows = [
    { phone_number: 'bad-number', amount: '50', network: 'MTN' },
  ];

  const result = processTransactions(rows);

  assert.equal(result.summary.successful, 0);
  assert.equal(result.summary.failed, 1);
  assert.equal(result.summary.finalBalance, 100);
});
