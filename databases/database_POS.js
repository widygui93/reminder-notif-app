const db = require('../models/index');
require('dotenv').config();

const database_POS = new db.Sequelize(`
  mysql://${process.env.POS_DB_USER}:${process.env.POS_DB_PASSWORD}@${process.env.POS_DB_HOST}:${process.env.POS_DB_PORT}/${process.env.POS_DB}`
);

module.exports =  database_POS;