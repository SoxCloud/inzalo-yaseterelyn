const { google } = require('googleapis');
const path = require('path');

// Load Google Sheets credentials
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '..', 'googlekey.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const SPREADSHEET_ID = '19Lc1fyxI9ewtVAo5rupI1iYh6h3T-UIQyc-Niwpn_dY';
const RANGE = 'Members!A2:F'; // Adjust if you have more columns

const contributionsFetcher = require('./contributions');

module.exports = async function () {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  // Ensure contributions is resolved if it's a function
  const contributions = typeof contributionsFetcher === 'function'
    ? await contributionsFetcher()
    : contributionsFetcher;

  return rows.map(row => {
    const memberId = row[0];
    const memberContributions = contributions.filter(c => c.memberId === memberId);
    const total = memberContributions.reduce((sum, c) => sum + c.amount, 0);

    // Find the most recent contribution (by date)
    const mostRecent = memberContributions.reduce((latest, curr) => {
      return !latest || new Date(curr.date) > new Date(latest.date) ? curr : latest;
    }, null);

    return {
      id: memberId,
      name: row[1],
      age: row[2] || '',
      status: row[3] || '',
      type: row[4] || '',
      parentId: row[5] || null,
      totalContributed: total,
      latestContribution: mostRecent?.amount || 0,
      latestContributionDate: mostRecent?.date || ''
    };
  });
};
