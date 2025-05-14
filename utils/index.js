// utils.js
require("dotenv").config(); // Ensure dotenv is loaded

const port = process.env.PORT || 3000;  // Default port if not set
const dburl = process.env.DATABASE_URL
const secretKey = process.env.SECRETKEY
const smtpmail = process.env.SMTP_MAIL
const smtppass = process.env.SMTP_PASS
const smtphost = process.env.SMTP_HOST
const smtpport = process.env.SMTP_PORT
module.exports = {
  port,
  dburl,
  secretKey,
  smtpmail,
  smtppass,
  smtphost,
  smtpport
};
