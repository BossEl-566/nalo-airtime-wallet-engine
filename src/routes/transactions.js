const express = require('express');
const multer = require('multer');
const { parseCsv } = require('../utils/csvParser');
const { processTransactions } = require('../services/transactionService');
const { getWalletBalance, resetWallet } = require('../storage/walletStore');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.get('/wallet', (req, res) => {
  res.json({ balance: getWalletBalance() });
});

router.post('/wallet/reset', (req, res) => {
  const balance = Number(req.body.balance ?? 1000);

  if (!Number.isFinite(balance) || balance < 0) {
    return res.status(400).json({ error: 'balance must be a non-negative number' });
  }

  return res.json({ balance: resetWallet(balance) });
});

router.post('/bulk', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required using form field "file"' });
  }

  if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
    return res.status(400).json({ error: 'only CSV files are accepted' });
  }

  try {
    const rows = parseCsv(req.file.buffer);
    const report = processTransactions(rows);
    return res.json(report);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
