import revenueReportController from '../controllers/revenueReportController.js';
import { withAccessLevel } from '../utils/auth-utils.js';

/**
 * Register revenue report routes.
 * All routes require manager level or higher access.
 */
export function registerRevenueReportRoutes(app) {
	// Get full detailed revenue report with all transactions and expenses
	app.post(
		'/api/revenue-report/full',
		withAccessLevel('manager', revenueReportController.getRevenueReport)
	);

	// Get summary revenue report (totals only, no detailed arrays)
	app.post(
		'/api/revenue-report/summary',
		withAccessLevel(
			'manager',
			revenueReportController.getRevenueReportSummary
		)
	);

	// Get aggregated revenue report (grand totals across all selected businesses)
	app.post(
		'/api/revenue-report/aggregated',
		withAccessLevel(
			'manager',
			revenueReportController.getAllBusinessesRevenueReport
		)
	);
}
