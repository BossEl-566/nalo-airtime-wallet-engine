const crypto = require('crypto');
const { validateTransaction } = require('../validators/transactionValidator');
const { getWalletBalance, setWalletBalance } = require('../storage/walletStore');

function fingerprint(transaction) {
  return crypto
    .createHash('sha256')
    .update(`${transaction.phoneNumber}|${transaction.amount}|${transaction.network}`)
    .digest('hex');
}

function processTransactions(rows) {
  const openingBalance = getWalletBalance();
  let runningBalance = openingBalance;

  const successfulTransactions = [];
  const failedTransactions = [];
  const seen = new Set();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const validation = validateTransaction(row);

    if (!validation.valid) {
      failedTransactions.push({
        row: rowNumber,
        phoneNumber: String(row.phone_number ?? '').trim(),
        amount: String(row.amount ?? '').trim(),
        network: String(row.network ?? '').trim(),
        reason: validation.reason,
      });
      return;
    }

    const transaction = validation.transaction;
    const id = fingerprint(transaction);

    if (seen.has(id)) {
      failedTransactions.push({
        row: rowNumber,
        ...transaction,
        reason: 'duplicate transaction',
      });
      return;
    }

    seen.add(id);

    if (transaction.amount > runningBalance) {
      failedTransactions.push({
        row: rowNumber,
        ...transaction,
        reason: 'insufficient balance',
      });
      return;
    }

    runningBalance = Number((runningBalance - transaction.amount).toFixed(2));

    successfulTransactions.push({
      row: rowNumber,
      ...transaction,
      status: 'success',
      balanceAfter: runningBalance,
    });
  });

  setWalletBalance(runningBalance);

  const totalDebited = successfulTransactions.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return {
    summary: {
      totalRows: rows.length,
      successful: successfulTransactions.length,
      failed: failedTransactions.length,
      totalDebited: Number(totalDebited.toFixed(2)),
      openingBalance,
      finalBalance: runningBalance,
    },
    successfulTransactions,
    failedTransactions,
  };
}

module.exports = { processTransactions, fingerprint };
