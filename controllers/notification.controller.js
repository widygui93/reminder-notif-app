const database_POS = require('../databases/database_POS');
const db = require('../models');
const Notification = db.notification;
require('dotenv').config();

exports.getReport = async (req, res) => {
	const dateFrom = req.body.startDate
	const dateTo = req.body.endDate

	try {
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

		let result = await database_POS.query(
		  `SELECT s.date AS payment_date, c.customer_name , c.customer_email, c.customer_phone FROM sales s JOIN customers c on s.customer_id = c.id WHERE s.date = DATE_FORMAT(DATE_SUB(CONVERT_TZ(:dateFrom, '+00:00', '+07:00'), INTERVAL ${process.env.INTERVAL_DAYS} DAY), '%Y-%m-%d');`,
		  { raw: true, type: database_POS.QueryTypes.SELECT, replacements: { dateFrom }} 
		)

		console.log("get future data notification POS successfully")

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