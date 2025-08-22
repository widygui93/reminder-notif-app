module.exports = app => {
	const notifications = require('../controllers/notification.controller')
	const router = require('express').Router()

	router.post('/report', notifications.getReport)
	router.post('/future', notifications.getFutureNotification)

	app.use('/api/notification', router)
}