import { query as sqlQuery } from '../db/mysql.js';

/**
 * Generates a comprehensive revenue report combining transactions and expenses.
 * 
 * @param {string[]} req.body.businessIds - Optional array of specific business UUIDs to report on
 * @param {string} req.body.businessType - Optional business type filter ('zoo', 'retail', 'food', 'vet_clinic')
 * @param {string} req.body.startDate - Optional start date for filtering (YYYY-MM-DD or datetime)
 * @param {string} req.body.endDate - Optional end date for filtering (YYYY-MM-DD or datetime)
 * 
 * @returns {Promise<Array>} Array of business revenue reports with:
 *   - businessId: UUID of the business
 *   - businessName: Name of the business
 *   - businessType: Type of business
 *   - totalRevenue: Sum of all transactions (filtered by date if provided)
 *   - totalExpenses: Sum of all expenses (filtered by date if provided)
 *   - netProfit: totalRevenue - totalExpenses
 *   - transactions: Array of transaction records (filtered by date if provided)
 *   - expenses: Array of expense records (filtered by date if provided)
 */
async function getRevenueReport(req, _res) {
	const { businessIds, businessType, startDate, endDate } = req.body;

	// Build the WHERE clause for business filtering
	let businessWhereClause = 'WHERE b.deletedAt IS NULL';
	let businessParams = [];

	if (businessIds && Array.isArray(businessIds) && businessIds.length > 0) {
		// Filter by specific business IDs (if it was given in request body)
		const placeholders = businessIds.map(() => '?').join(', ');
		businessWhereClause += ` AND b.businessId IN (${placeholders})`;
		businessParams = [...businessIds];
	} else if (businessType) {
		// Filter by business type otherwise if businessType was given in request body
		businessWhereClause += ' AND b.type = ?';
		businessParams = [businessType];
	}
	//otherwise if neither it just gets all of them cause no WHERE clause.

	// Main query to get businesses
	const businessQuery = `
		SELECT 
			b.businessId,
			b.name as businessName,
			b.type as businessType
		FROM Business b
		${businessWhereClause}
		ORDER BY b.name
	`;

	const businesses = await sqlQuery(businessQuery, businessParams);
	console.log('Businesses found:', businesses.length);
	console.log('Businesses type:', typeof businesses, 'is array?', Array.isArray(businesses));
	console.log('First business:', businesses[0]);
	console.log('Business query:', businessQuery);
	console.log('Business params:', businessParams);

	// businesses is an array of objects
	const businessArray = Array.isArray(businesses) ? businesses : [businesses];

	// For each business, get transactions and expenses
	const reports = await Promise.all(
		businessArray.map(async (business) => {
			console.log('Processing business:', typeof business, JSON.stringify(business));
			// Get transactions for this business with customer names
			let transactionsQuery = `
				SELECT 
					t.transactionId,
					t.description,
					t.amount,
					t.businessId,
					t.purchaseDate,
					COALESCE(CONCAT(c.firstName, ' ', c.lastName), CONCAT(e.firstName, ' ', e.lastName), 'Unknown') as customerName
				FROM Transaction t
				LEFT JOIN PurchasedItem pi ON t.transactionId = pi.transactionId
				LEFT JOIN Customer c ON pi.customerId = c.customerId
				LEFT JOIN Employee e ON pi.customerId = e.employeeId
				WHERE t.businessId = ? AND t.deletedAt IS NULL
			`;
			const transactionParams = [business.businessId];

			// Add optional date range filtering using purchaseDate
			if (startDate) {
				transactionsQuery += ` AND purchaseDate >= ?`;
				transactionParams.push(startDate);
			}
			if (endDate) {
				transactionsQuery += ` AND purchaseDate <= ?`;
				transactionParams.push(endDate);
			}

			transactionsQuery += ` ORDER BY purchaseDate DESC`;

			const transactions = await sqlQuery(transactionsQuery, transactionParams);

			// Get expenses for this business (with optional date filtering)
			let expensesQuery = `
				SELECT 
					expenseId,
					expenseDescription,
					cost,
					purchaseDate,
					businessId
				FROM Expense
				WHERE businessId = ? AND deletedAt IS NULL
			`;
			const expenseParams = [business.businessId];

			// Add date range filtering for expenses if provided if startDate or endDate was given in request body
			if (startDate) {
				expensesQuery += ` AND purchaseDate >= ?`;
				expenseParams.push(startDate);
			}
			if (endDate) {
				expensesQuery += ` AND purchaseDate <= ?`;
				expenseParams.push(endDate);
			}

			expensesQuery += ` ORDER BY purchaseDate DESC`;

			const expenses = await sqlQuery(expensesQuery, expenseParams);

			// Calculate totals
			const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
			const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.cost || 0), 0);
			const netProfit = totalRevenue - totalExpenses;

			console.log('Business being processed:', business);
			const result = {
				businessId: business.businessId,
				businessName: business.businessName,
				businessType: business.businessType,
				totalRevenue: parseFloat(totalRevenue.toFixed(2)),
				totalExpenses: parseFloat(totalExpenses.toFixed(2)),
				netProfit: parseFloat(netProfit.toFixed(2)),
				transactionCount: transactions.length,
				expenseCount: expenses.length,
				transactions,
				expenses,
				dateRange: {
					startDate: startDate || null,
					endDate: endDate || null
				}
			};
			console.log('Result object:', result);
			return result;
		})
	);

	return [reports];
}

/**
 * Gets a summary revenue report with just the totals
 * Reports revenue without detailed transactions/expenses.
 * @param {string[]} req.body.businessIds - Optional array of specific business UUIDs
 * @param {string} req.body.businessType - Optional business type filter
 * @param {string} req.body.startDate - Optional start date for filtering
 * @param {string} req.body.endDate - Optional end date for filtering
 * 
 * @returns {Promise<Array>} Array of summary reports (without detailed transaction/expense arrays)
 */
async function getRevenueReportSummary(req, _res) {
	const [fullReport] = await getRevenueReport(req, _res);
	
	// Remove the detailed transaction and expense arrays for a lighter response
	return [fullReport.map(report => ({
		businessId: report.businessId,
		businessName: report.businessName,
		businessType: report.businessType,
		totalRevenue: report.totalRevenue,
		totalExpenses: report.totalExpenses,
		netProfit: report.netProfit,
		transactionCount: report.transactionCount,
		expenseCount: report.expenseCount,
		dateRange: report.dateRange
	}))];
}

/**
 * Gets an aggregated report across all selected businesses.
 * Combines the revenue reports of all businesses into a single report.
 * Includes the totals for all businesses in the report and their expenses and transactions.
 * @param {string[]} req.body.businessIds - Optional array of specific business UUIDs
 * @param {string} req.body.businessType - Optional business type filter
 * @param {string} req.body.startDate - Optional start date for filtering
 * @param {string} req.body.endDate - Optional end date for filtering
 * 
 * @returns {Promise<Object>} Single aggregated report with grand totals
 */
async function getAllBusinessesRevenueReport(req, _res) {
	const [reports] = await getRevenueReport(req, _res);
	
	const aggregated = reports.reduce(
		(acc, report) => ({
			totalRevenue: acc.totalRevenue + report.totalRevenue,
			totalExpenses: acc.totalExpenses + report.totalExpenses,
			netProfit: acc.netProfit + report.netProfit,
			businessCount: acc.businessCount + 1,
			transactionCount: acc.transactionCount + report.transactionCount,
			expenseCount: acc.expenseCount + report.expenseCount
		}),
		{
			totalRevenue: 0,
			totalExpenses: 0,
			netProfit: 0,
			businessCount: 0,
			transactionCount: 0,
			expenseCount: 0
		}
	);

	//totalRevenue, totalExpenses, netprofit are floats and must be converted to strings with 2 decimal places in order to be returned as JSON.
	return [{
		...aggregated,
		totalRevenue: parseFloat(aggregated.totalRevenue.toFixed(2)),
		totalExpenses: parseFloat(aggregated.totalExpenses.toFixed(2)),
		netProfit: parseFloat(aggregated.netProfit.toFixed(2)),
		dateRange: {
			startDate: req.body.startDate || null,
			endDate: req.body.endDate || null
		},
		businessDetails: reports.map(r => ({
			businessId: r.businessId,
			businessName: r.businessName,
			businessType: r.businessType,
			netProfit: r.netProfit
		}))
	}];
}

export default {
	getRevenueReport,
	getRevenueReportSummary,
	getAllBusinessesRevenueReport
};