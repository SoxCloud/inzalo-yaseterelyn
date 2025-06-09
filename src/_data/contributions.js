// src/_data/contributions.js
const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '..', 'googlekey.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const SPREADSHEET_ID = '19Lc1fyxI9ewtVAo5rupI1iYh6h3T-UIQyc-Niwpn_dY';
const RANGE = 'Contributions!A2:E'; // Make sure this covers all columns

module.exports = async function () {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values;

  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map(r => ({
    id:        r[0] ?? '',
    memberId:  r[1] ?? '',
    date:      r[2] ?? '',
    amount:    parseFloat(r[3] ?? 0),
    eventId:   r[4] ?? '',
  }));
};
