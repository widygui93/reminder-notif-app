const {getDataTransactionPOSFutureNotification} = require('../databases/database_POS');
const {getDataNotificationReport} = require('../databases/database_reminder_notif')
const {convertDataFutureNotification} = require('../utils/convertData')

exports.getReport = async (req, res) => {
	const dateFrom = req.body.startDate
	const dateTo = req.body.endDate

	try {
		let result = await getDataNotificationReport(dateFrom, dateTo)
		if(!result){
			res.status(404).send({
				message: "notification not found"
			})
		}
		res.send(result)
	} catch(error){
		res.status(409).send({
			message: error.message || "some error while showing notification report"
		})
	}
}

exports.getFutureNotification = async (req, res) => {
	const dateFrom = req.body.startDate
	const dateTo = req.body.endDate

	try{
		console.log("start to query to database POS to get future data notification")

		let dataTransactionPos = await getDataTransactionPOSFutureNotification(dateFrom)

		const result = convertDataFutureNotification(dataTransactionPos, dateFrom)

		if(!result){
			res.status(404).send({
				message: "future notification not found"
			})
		}
		res.send(result)

	} catch(error){
		res.status(409).send({
			message: error.message || "some error while showing future notification report"
		})
	}



}