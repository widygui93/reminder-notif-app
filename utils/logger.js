const winston = require('winston')
require('winston-daily-rotate-file')

const { combine, timestamp, printf} = winston.format

const fileRotateTransport = new winston.transports.DailyRotateFile({
	filename: 'application-%DATE%.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxFiles: '14d',
	dirname: './logs'
})

const logger = winston.createLogger({
	level: 'info',
	format: combine(
		timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
		printf(logs => `{"timestamp":"${logs.timestamp}","level":"${logs.level}","message":"${logs.message}"}`)
	),
	transports: [fileRotateTransport]
})

module.exports = {logger}