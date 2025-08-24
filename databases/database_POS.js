const db = require('../models/index');
require('dotenv').config();
const { logger } = require('../utils/logger')

const database_POS = new db.Sequelize(`
  mysql://${process.env.POS_DB_USER}:${process.env.POS_DB_PASSWORD}@${process.env.POS_DB_HOST}:${process.env.POS_DB_PORT}/${process.env.POS_DB}`
);

const getDataTransactionPOSNotificationReminder = async ()=> {
  try{
    logger.info("start to query to database POS to get data transaction")

    let result = await database_POS.query(
      `SELECT s.id AS id_sales, s.date AS payment_date, c.customer_name , c.customer_email, c.customer_phone , sd.product_name FROM sales s JOIN customers c on s.customer_id = c.id JOIN sale_details sd ON s.id = sd.sale_id WHERE s.date = DATE_FORMAT(DATE_SUB(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00'), INTERVAL ${process.env.INTERVAL_DAYS} DAY), '%Y-%m-%d');`,
      { raw: true, type: database_POS.QueryTypes.SELECT } 
    )

    logger.info("get data transaction POS successfully")

    return result

  } catch(error){
    logger.error(error)
  }

}

const getDataTransactionPOSFutureNotification = async(dateFrom) => {
  try{
    logger.info("start to query to database POS to get future notification")

    let result = await database_POS.query(
      `SELECT s.date AS payment_date, :dateFrom AS notification_date, c.customer_name , c.customer_email, c.customer_phone FROM sales s JOIN customers c on s.customer_id = c.id WHERE s.date = DATE_FORMAT(DATE_SUB(CONVERT_TZ(:dateFrom, '+00:00', '+07:00'), INTERVAL ${process.env.INTERVAL_DAYS} DAY), '%Y-%m-%d');`,
      { raw: true, type: database_POS.QueryTypes.SELECT, replacements: { dateFrom }} 
    )

    logger.info("get future data notification POS successfully")
    return result

  } catch(error){
    logger.error(error)
  }
}

module.exports =  {
  database_POS, 
  getDataTransactionPOSNotificationReminder,
  getDataTransactionPOSFutureNotification
 };