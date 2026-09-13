const { parse } = require('csv-parse/sync');

function parseCsv(buffer) {
  const text = buffer.toString('utf8').replace(/^\uFEFF/, '');

  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const requiredHeaders = ['phone_number', 'amount', 'network'];
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  for (const header of requiredHeaders) {
    if (!headers.includes(header)) {
      throw new Error(`missing required column: ${header}`);
    }
  }

  return rows;
}

module.exports = { parseCsv };
