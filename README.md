# twilio-chatbot

This is a basic application, which can receive SMS/MMS via Twilio, save data about users in lowdb, reply with SMS and make some actions with user responses (send reports to email, save files from MMS to Dropbox, generate .csv reports).

## How to run:
* create `.env` file with necessary data:
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
DROPBOX_AUTH_TOKEN=
SERVICE_NUMBER= //number bought on twilio
SEND_MAIL_TO=
SMTP_USER=
SMTP_PASS=
```
* execute
```
docker build -t edzh1/twilio-chatbot .
docker run -p 80:3000 -d edzh1/twilio-chatbot
```

## What does it do now (step by step):
> Every step starts from receiving an SMS to `SERVICE_NUMBER` (Twilio should use `POST` webhook to `your-chatbot-domain/receive`). Data is saved in DB after each step
* creates new User, saves in DB, asks for a name (saves media to Dropbox, if a user has sent MMS)
* saves user name, asks for an address
* asks a user to describe what do they want to report to city council
* sends a report to `SEND_MAIL_TO` (saves media to Dropbox, if a user has sent MMS)

Visit `your-chatbot-domain/generate-report` to get .csv data from db.
