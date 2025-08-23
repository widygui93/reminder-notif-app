const twilio = require("twilio");
require('dotenv').config()

const sendNotification = function (dataNotifications){
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

module.exports = {sendNotification}