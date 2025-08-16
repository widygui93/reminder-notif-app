const db = require('../models')
const Notification = db.sequelize

exports.getReport = async (req, res) => {
	const dateFrom = req.body.startDate
	const dateTo = req.body.endDate

	try {
		let result = await Notification.query(
      	`SELECT payment_date, notification_date, customer_name , customer_email, customer_phone FROM notifications WHERE DATE(notification_date) >= '${dateFrom}' and DATE(notification_date) <= '${dateTo}' order by notification_date LIMIT 45 ;`,
      	{ raw: true, type: Notification.QueryTypes.SELECT} 
    	)

		// const result = await Notification.findAll({
		// 	attributes: ['payment_date', 'notification_date','customer_name','customer_email','customer_phone'],
		// 	where: {
		// 		[db.Sequelize.Op.between]: [{ notification_date: new Date(dateFrom) }, { notification_date: new Date(dateTo) }],
		// 	},
		// 	order: [['notification_date', 'DESC']],
		// 	limit: 45
		// })
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