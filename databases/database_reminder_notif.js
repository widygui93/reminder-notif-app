const db = require('../models/index');
const Notification = db.notification;
const NotificationProduct = db.notificationProduct;
require('dotenv').config();

const database_reminder_notif = new db.Sequelize(`
  mysql://${process.env.REMINDER_NOTIF_DB_USER}:${process.env.REMINDER_NOTIF_DB_PASSWORD}@${process.env.REMINDER_NOTIF_DB_HOST}:${process.env.REMINDER_NOTIF_DB_PORT}/${process.env.REMINDER_NOTIF_DB}`
);

const saveIntoDatabase = async function(dataNotifications){
  const transaction = await database_reminder_notif.transaction()
  try {
    await Promise.all(dataNotifications.map(async (dataNotification) => {
      await Notification.create({
        id: dataNotification.id,
        payment_date: dataNotification.payment_date,
        notification_date: dataNotification.notification_date,
        customer_name: dataNotification.customer_name,
        customer_email: dataNotification.customer_email,
        customer_phone: dataNotification.customer_phone
      }, { transaction });
    }));
    await Promise.all(dataNotifications.map(async (dataNotification) => {
      await Promise.all(dataNotification.list_products.map(async (product) => {
        await NotificationProduct.create({
          notification_id: dataNotification.id,
          product_name: product
        }, { transaction });
      }))
    }));
    await transaction.commit();
    console.log('All records have been inserted successfully.')
  } catch (error) {
    await transaction.rollback();
    console.log(`Error occurred while inserting records: ${error}`)
  }
}

const getDataNotificationReport = async function(dateFrom, dateTo){
  try{
    let result = await Notification.findAll({
      attributes: ['payment_date', 'notification_date','customer_name','customer_email','customer_phone'],
      where: {
        notification_date: {
          [db.Sequelize.Op.between]: [dateFrom, dateTo]
        }
      },
      order: [['notification_date', 'DESC']],
      limit: 45
    })

    console.log('get data for notification report successfully')
    return result

  } catch (error){
    console.log(error)
  }
}

module.exports =  {database_reminder_notif, saveIntoDatabase, getDataNotificationReport}