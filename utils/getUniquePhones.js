const getUniquePhones = function(dataTransactionPos) {
	return (
		[...new Set(dataTransactionPos.map(item => item.customer_phone))].map(customer_phone => ({ customer_phone }))
	)
} 

module.exports = {
	getUniquePhones
}