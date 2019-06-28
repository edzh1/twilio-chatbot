const { Parser } = require('json2csv');
const db = require('../db');

class ReportService {
  async generateCSV() {
    const dbData = await db.get('results').value();
    const fields = ['id', 'phone', 'firstMessage', 'firstMessage', 'fullname', 'address', 'reason'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(dbData);

    return csv;
  }
}

module.exports = new ReportService();