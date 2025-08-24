const { database_reminder_notif } = require('./databases/database_reminder_notif');
const { database_POS } = require('./databases/database_POS');
const { logger } = require('./utils/logger')
const express = require('express')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors({
  origin: "http://localhost:5173",
  methods: "POST"
}))

database_reminder_notif.authenticate()
  .then(() => {
    logger.info('Connection to database reminder notification has been established successfully.')
  })
  .catch(err => {
    logger.error('Unable to connect to the database reminder notification:', err);
    process.exit();
  })

database_POS.authenticate()
  .then(() => {
    logger.info('Connection to database POS has been established successfully.')
  })
  .catch(err => {
    logger.error('Unable to connect to the database POS:', err);
    process.exit();
  })

require('./routes/notification.routes')(app)

require('./scheduler')

app.listen('8080', () => {
  console.log('server is listening on port 8080')
})