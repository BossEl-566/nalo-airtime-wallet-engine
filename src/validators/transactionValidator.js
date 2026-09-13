const ALLOWED_NETWORKS = new Set(['MTN', 'TELECEL', 'AT']);

function normalizePhoneNumber(value) {
  const phone = String(value ?? '').trim().replace(/\s+/g, '');

  if (/^0\d{9}$/.test(phone)) return phone;
  if (/^233\d{9}$/.test(phone)) return `0${phone.slice(3)}`;

  return null;
}

function normalizeNetwork(value) {
  const network = String(value ?? '').trim().toUpperCase();
  return ALLOWED_NETWORKS.has(network) ? network : null;
}

function parseAmount(value) {
  const raw = String(value ?? '').trim();
  if (raw === '') return null;

  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return Number(amount.toFixed(2));
}

function validateTransaction(row) {
  const phoneNumber = normalizePhoneNumber(row.phone_number);
  if (!phoneNumber) {
    return { valid: false, reason: 'invalid Ghanaian phone number' };
  }

  const network = normalizeNetwork(row.network);
  if (!network) {
    return { valid: false, reason: 'invalid network' };
  }

  const amount = parseAmount(row.amount);
  if (amount === null) {
    return { valid: false, reason: 'invalid amount' };
  }

  return {
    valid: true,
    transaction: {
      phoneNumber,
      network,
      amount,
    },
  };
}

module.exports = {
  ALLOWED_NETWORKS,
  normalizePhoneNumber,
  normalizeNetwork,
  parseAmount,
  validateTransaction,
};
