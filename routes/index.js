const express = require('express');
const router = express.Router();
const twilio = require('twilio');

const ChatService = require('../services/ChatService');
const ReportService = require('../services/ReportService');

router.post('/receive', async function (req, res, next) {
  const twiml = new twilio.TwimlResponse();

  twiml.message('');

  try {
    await ChatService.proceedMessage(req.body);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (error) {
    res.status(500).send('Something went wrong')
  }
});

router.get('/generate-report', async function (req, res, next) {
  try {
    const result = await ReportService.generateCSV();

    res.set('Content-Type', 'text/csv');
    res.set("Content-Disposition", 'attachment; filename=neighborhood_association.csv');
    res.status(200).send(result)
  } catch (error) {
    res.status(500).send('Something went wrong')
  }
});

module.exports = router;