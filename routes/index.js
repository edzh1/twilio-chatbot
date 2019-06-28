const express = require('express');
const router = express.Router();
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const ChatService = require('../services/ChatService');
const ReportService = require('../services/ReportService');

router.post('/receive', async function (req, res, next) {
  const twiml = new MessagingResponse();

  twiml.message('The Robots are coming! Head for the hills!');

  try {
    await ChatService.proceedMessage(req.body);
    res.sendStatus(200);
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