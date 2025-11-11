import { App } from './src/app.js';
import { registerEmployeeRoutes } from './src/routes/employee.js';
import { registerAuthRoutes } from './src/routes/auth.js';
import { registerRevenueReportRoutes } from './src/routes/revenueReport.js';
import { registerShiftReportRoutes } from './src/routes/shiftReport.js';
import { registerHabitatRoutes } from './src/routes/habitat.js';
import { registerAnimalRoutes } from './src/routes/animal.js';
import { registerShiftRoutes } from './src/routes/shift.js';
import { registerBusinessRoutes } from './src/routes/business.js';
import { registerMedicalRecordRoutes } from './src/routes/medicalRecord.js';
import { registerDietRoutes } from './src/routes/diet.js';
import { registerNotificationRoutes } from './src/routes/notification.js';
import { registerPurchaseRoutes } from './src/routes/purchase.js';
import { registerTransactionRoutes } from './src/routes/transaction.js';
import { registerItemRoutes } from './src/routes/item.js';
import { registerAttractionRoutes } from './src/routes/attraction.js';
import { registerReportRoutes } from './src/routes/report.js';
import { registerExpenseRoutes } from './src/routes/expense.js';
import { registerAnimalReportRoutes } from './src/routes/animalReport.js';
import { registerMembershipRoutes } from './src/routes/membership.js';
import { registerCustomerRoutes } from './src/routes/customer.js';

/**
 * Main entry point for the API
 *
 *
 * This function creates a new App instance, registers all routes,
 * and delegates the request handling to the App instance
 */
export default async function handler(req, res) {
	const app = new App();

	// !--- start route registration ---!
	registerAuthRoutes(app);
	registerEmployeeRoutes(app);
	registerRevenueReportRoutes(app);
	registerShiftReportRoutes(app);
	registerHabitatRoutes(app);
	registerAnimalRoutes(app);
	registerShiftRoutes(app);
	registerBusinessRoutes(app);
	registerMedicalRecordRoutes(app);
	registerDietRoutes(app);
	registerNotificationRoutes(app);
	registerPurchaseRoutes(app);
	registerTransactionRoutes(app);
	registerItemRoutes(app);
	registerAttractionRoutes(app);
	registerReportRoutes(app);
	registerExpenseRoutes(app);
	registerAnimalReportRoutes(app);
	registerMembershipRoutes(app);
	registerCustomerRoutes(app);
	// !--- end route registration ---!

	return await app.handleVercel(req, res);
}
