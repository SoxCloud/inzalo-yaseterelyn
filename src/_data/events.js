const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '..', 'googlekey.json'), // adjust path if needed
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const SPREADSHEET_ID = '19Lc1fyxI9ewtVAo5rupI1iYh6h3T-UIQyc-Niwpn_dY'; // your actual ID
const RANGE = 'Events!A2:G'; // adjust range to your sheet structure

module.exports = async function () {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows.map(r => ({
    eventId:       r[0] ?? '',
    deceasedName:  r[1] ?? '',
    deceasedId:    r[2] ?? '',
    date:          r[3] ?? '',
    eligible:      r[4] ?? '',
    total:         parseFloat(r[5] ?? 0),
    payout:        parseFloat(r[6] ?? 0),
  }));
};
