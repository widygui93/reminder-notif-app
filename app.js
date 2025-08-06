const twilio = require("twilio");
const db = require('./models/index');
const crypto = require('crypto');
require('dotenv').config()

const Notification = db.notification;
const NotificationProduct = db.notificationProduct;

const database_reminder_notif = new db.Sequelize(`
  mysql://${process.env.REMINDER_NOTIF_DB_USER}:${process.env.REMINDER_NOTIF_DB_PASSWORD}@${process.env.REMINDER_NOTIF_DB_HOST}:${process.env.REMINDER_NOTIF_DB_PORT}/${process.env.REMINDER_NOTIF_DB}`
);
const database_POS = new db.Sequelize(`
  mysql://${process.env.POS_DB_USER}:${process.env.POS_DB_PASSWORD}@${process.env.POS_DB_HOST}:${process.env.POS_DB_PORT}/${process.env.POS_DB}`
);

database_reminder_notif.authenticate()
  .then(() => {
    console.log('Connection to database reminder notification has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database reminder notification:', err);
    process.exit();
  })

database_POS.authenticate()
  .then(() => {
    console.log('Connection to database POS has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database POS:', err);
    process.exit();
  })

let getDataTransactionPOS = async ()=> {
  try{
    console.log("start to query to database POS to get data transaction")

    let result = await database_POS.query(
      `SELECT s.id AS id_sales, s.date AS payment_date, c.customer_name , c.customer_email, c.customer_phone , sd.product_name FROM sales s JOIN customers c on s.customer_id = c.id JOIN sale_details sd ON s.id = sd.sale_id WHERE s.date = DATE_FORMAT(DATE_SUB(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00'), INTERVAL ${process.env.INTERVAL_DAYS} DAY), '%Y-%m-%d');`,
      { raw: true, type: database_POS.QueryTypes.SELECT } 
    )

    console.log("get data transaction POS successfully")

    return result

  } catch(error){
    console.error(error)
  }

}

const convertDataForNotification = (dataTransactionPos)=> {
  const uniquePhones = [...new Set(dataTransactionPos.map(item => item.customer_phone))].map(customer_phone => ({ customer_phone }));

  const result = []
  for (const uniquePhone of uniquePhones){
    for(const dataPos of dataTransactionPos){
      if(uniquePhone.customer_phone == dataPos.customer_phone){
        result.push(
          {
            id: crypto.randomBytes(10).toString('hex'),
            payment_date: dataPos.payment_date,
            notification_date: new Intl.DateTimeFormat('en-CA').format(new Date()),
            customer_name: dataPos.customer_name,
            customer_email: dataPos.customer_email,
            customer_phone: dataPos.customer_phone
          }
        )
        break;
      }
    }
  }

  let listProducts = []
  for(const [index, uniquePhone] of uniquePhones.entries()){
    for(const dataPos of dataTransactionPos){
      if(uniquePhone.customer_phone == dataPos.customer_phone){
        listProducts.push(dataPos.product_name)
      }
    }
    result[index].list_products = listProducts
    listProducts = []
  }

  return result
}

const sendNotification = (dataNotifications) => {
  // Find your Account SID and Auth Token at twilio.com/console
  // and set the environment variables. See http://twil.io/secure
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  let convertToIndonesiaPhoneFormat = ""
  let listProductsString = ""

  dataNotifications.map(async (dataNotificationMessage) => {
    convertToIndonesiaPhoneFormat = "+62" + dataNotificationMessage.customer_phone.slice(1)
    for (let i = 0; i < dataNotificationMessage.list_products.length; i++) {
      listProductsString += " " + dataNotificationMessage.list_products[i] + ","
      if( i == 2) break;
    }

    const message = await client.messages.create({
      body: `Halo ${dataNotificationMessage.customer_name},Terima kasih atas kepercayaan anda sebagai pelanggan kami di toko XYZ. Sebagai bentuk pelayanan kami terhadap pelanggan setia, kami ingin mengingatkan anda bahwa product seperti${listProductsString} akan habis sekitar 1 minggu kedepan. Apakah anda ingin dikirimkan product nya untuk distok? jika iya anda dapat mencantumkan alamat anda dan jumlah product yang dipesan`,
      from: `whatsapp:${process.env.FROM_NUMBER}`,
      to: `whatsapp:${convertToIndonesiaPhoneFormat}`,
    });

    convertToIndonesiaPhoneFormat = ""
    listProductsString = ""
  })
}

const saveIntoDatabase = async (dataNotifications) => {
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

(async function(){
  try {

    let dataTransactionPos = await getDataTransactionPOS()
    let dataNotifications = convertDataForNotification(dataTransactionPos)
    await sendNotification(dataNotifications)
    await saveIntoDatabase(dataNotifications)

    // reset all variable to be use again
    dataTransactionPos              = []
    dataNotifications               = []

  } catch(err){
    console.log(err)
  }
})();