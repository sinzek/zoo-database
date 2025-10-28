import shiftReport from '../controllers/shiftReport.js';
import revenueReportController from '../controllers/revenueReportController.js';

export function registerReportRoutes(app) {
	app.post('/api/reports/shift/full', shiftReport.getFullShiftReport);
	app.post('/api/reports/shift/summary', shiftReport.getShiftSummaryReport);
	app.post(
		'/api/reports/shift/aggregated',
		shiftReport.getAggregatedShiftReport
	);
	app.post(
		'/api/reports/revenue/get-revenue-report',
		revenueReportController.getRevenueReport
	);
}
