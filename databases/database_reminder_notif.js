const db = require('../models/index');
require('dotenv').config();

const database_reminder_notif = new db.Sequelize(`
  mysql://${process.env.REMINDER_NOTIF_DB_USER}:${process.env.REMINDER_NOTIF_DB_PASSWORD}@${process.env.REMINDER_NOTIF_DB_HOST}:${process.env.REMINDER_NOTIF_DB_PORT}/${process.env.REMINDER_NOTIF_DB}`
);

module.exports =  database_reminder_notif;