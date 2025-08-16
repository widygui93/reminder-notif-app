const db = require('../models')
const Notification = db.notification

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