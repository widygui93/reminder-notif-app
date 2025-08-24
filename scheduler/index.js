const schedule = require('node-schedule');
const { getDataTransactionPOSNotificationReminder } = require('../databases/database_POS');
const {saveIntoDatabase} = require('../databases/database_reminder_notif')
const {convertDataNotificationReminder} = require('../utils/convertData')
const {sendNotification} = require('../core/app')
const { logger } = require('../utils/logger')


// hour 8 minutes 27
const job = schedule.scheduleJob('27 8 * * *', async function () {
	try {
		let dataTransactionPos = await getDataTransactionPOSNotificationReminder()
		let dataNotifications = convertDataNotificationReminder(dataTransactionPos)
		await sendNotification(dataNotifications)
		await saveIntoDatabase(dataNotifications)

		// reset all variable to be use again
		dataTransactionPos              = []
		dataNotifications               = []

	} catch(err){
		logger.error(err)
	}
})