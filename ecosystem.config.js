module.exports = {
  apps: [
    {
      name: "twilio-chatbot",
      script: "./bin/www",
      env: {
        "NODE_ENV": "production",
        "port": 3000
      }
    }
  ]
}
