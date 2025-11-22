import { withAccessLevel } from '../utils/auth-utils.js';
import expenseController from '../controllers/expenseController.js';

export function registerExpenseRoutes(app) {
	// Create expense - manager+ only
	app.post('/api/expense/create', withAccessLevel('manager', expenseController.createOne));

	// Get expense by ID
	app.post('/api/expense/get-one', expenseController.getOneById);

	// Get expenses by business
	app.post('/api/expense/get-by-business', expenseController.getManyByBusiness);

	// Get expenses by date range
	app.post('/api/expense/get-by-date-range', expenseController.getManyByDateRange);

	// Get total expenses by business
	app.post('/api/expense/get-total-by-business', expenseController.getTotalByBusiness);

	// Update expense - manager+ only
	app.put('/api/expense/update', withAccessLevel('manager', expenseController.updateOne));

	// Delete expense - admin only
	app.post('/api/expense/delete', withAccessLevel('db_admin', expenseController.deleteOne));

	// Get all deleted expenses - admin only
	app.post('/api/expense/get-all-deleted', withAccessLevel('db_admin', expenseController.getAllDeleted));

	// Get expenses - manager+ can view (filtered by business permission)
	app.post('/api/expense/get-by-business', withAccessLevel('manager', expenseController.getManyByBusiness));
}

