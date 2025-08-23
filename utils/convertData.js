const crypto = require('crypto');
const {getUniquePhones} = require('./getUniquePhones')

const convertDataNotificationReminder = function (dataTransactionPos){
	const uniquePhones = getUniquePhones(dataTransactionPos)
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

const convertDataFutureNotification = function(dataTransactionPos, dateFrom){
	const uniquePhones = getUniquePhones(dataTransactionPos)
	const result = []
	for (const uniquePhone of uniquePhones){
		for(const dataPos of dataTransactionPos){
		  if(uniquePhone.customer_phone == dataPos.customer_phone){
		    result.push(
		      {
		        payment_date: dataPos.payment_date,
		        notification_date: dateFrom,
		        customer_name: dataPos.customer_name,
		        customer_email: dataPos.customer_email,
		        customer_phone: dataPos.customer_phone
		      }
		    )
		    break;
		  }
		}
	}
	return result
}

module.exports = {
	convertDataNotificationReminder,
	convertDataFutureNotification
}