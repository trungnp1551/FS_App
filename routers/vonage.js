const Vonage = require('@vonage/server-sdk')

const vonage = new Vonage({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET
  })

module.exports = vonage