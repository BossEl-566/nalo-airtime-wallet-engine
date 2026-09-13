const fs = require('fs');
const path = require('path');

const WALLET_PATH = path.join(__dirname, '../../data/wallet.json');

function ensureWalletFile() {
  if (!fs.existsSync(WALLET_PATH)) {
    fs.writeFileSync(WALLET_PATH, JSON.stringify({ balance: 1000 }, null, 2));
  }
}

function getWalletBalance() {
  ensureWalletFile();
  const data = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf8'));
  return Number(data.balance);
}

function setWalletBalance(balance) {
  ensureWalletFile();

  const tempPath = `${WALLET_PATH}.tmp`;
  const payload = JSON.stringify({ balance: Number(balance.toFixed(2)) }, null, 2);

  fs.writeFileSync(tempPath, payload, 'utf8');
  fs.renameSync(tempPath, WALLET_PATH);
}

function resetWallet(balance = 1000) {
  setWalletBalance(Number(balance));
  return getWalletBalance();
}

module.exports = {
  getWalletBalance,
  setWalletBalance,
  resetWallet,
};
