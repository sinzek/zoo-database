import transactionController from '../controllers/transactionController.js';

export function registerTransactionRoutes(app) {
	app.post('/api/transactions/get-by-id', transactionController.getOneById);
	app.post(
		'/api/transactions/get-membership-transaction',
		transactionController.getMembershipTransaction
	);
}
