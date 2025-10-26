import { query } from '../db/mysql.js';

/**
 * Generates a comprehensive shift report with employee shift information.
 * 
 * @param {string[]} req.body.employeeIds - Optional array of specific employee UUIDs to report on
 * @param {string} req.body.businessId - Optional specific business UUID to filter by
 * @param {string} req.body.startDate - Optional start date for filtering (YYYY-MM-DD or datetime)
 * @param {string} req.body.endDate - Optional end date for filtering (YYYY-MM-DD or datetime)
 * 
 * @returns {Promise<Array>} Array of business shift reports with:
 *   - businessId: UUID of the business
 *   - businessName: Name of the business
 *   - businessType: Type of business
 *   - shifts: Array of shift records with employee details, location, and clock times
 */
async function getShiftReport(req, _res) {
	const { employeeIds, businessId, startDate, endDate } = req.body;

	// Build the base query for shifts with employee and business information
	let baseQuery = `
		SELECT 
			s.shiftId,
			s.start,
			s.end,
			s.attractionId,
			ets.shiftTakenId,
			ets.employeeId,
			ets.totalHours,
			e.firstName as employeeFirstName,
			e.lastName as employeeLastName,
			e.jobTitle,
			e.hourlyWage,
			b.businessId,
			b.name as businessName,
			b.type as businessType,
			a.name as attractionName,
			a.location as attractionLocation
		FROM EmployeeTakesShift ets
		JOIN Shift s ON ets.shiftId = s.shiftId
		JOIN Employee e ON ets.employeeId = e.employeeId
		JOIN Business b ON e.businessId = b.businessId
		LEFT JOIN Attraction a ON s.attractionId = a.attractionId
		WHERE s.deletedAt IS NULL AND e.deletedAt IS NULL AND b.deletedAt IS NULL
	`;

	const params = [];

	// Add employee ID filtering if provided
	if (employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
		const placeholders = employeeIds.map(() => '?').join(', ');
		baseQuery += ` AND ets.employeeId IN (${placeholders})`;
		params.push(...employeeIds);
	}

	// Add business filtering if provided
	if (businessId) {
		baseQuery += ` AND b.businessId = ?`;
		params.push(businessId);
	}

	// Add date range filtering if provided
	if (startDate) {
		baseQuery += ` AND s.start >= ?`;
		params.push(startDate);
	}
	if (endDate) {
		baseQuery += ` AND s.start <= ?`;
		params.push(endDate);
	}

	// Order by shift start date
	baseQuery += ` ORDER BY b.businessId, s.start DESC`;

	const shifts = await query(baseQuery, params);

	if (!shifts || shifts.length === 0) {
		return [];
	}

	// Get clock times for each shift
	const shiftsWithClockTimes = await Promise.all(
		shifts.map(async (shift) => {
			try {
				const clockTimes = await query(
					`SELECT clockTimeId, startTime, endTime 
					FROM EmployeeClockTime 
					WHERE shiftId = ? 
					ORDER BY startTime ASC`,
					[shift.shiftId]
				);
				return {
					...shift,
					clockTimes: clockTimes || []
				};
			} catch {
				return {
					...shift,
					clockTimes: []
				};
			}
		})
	);

	// Group by business
	const businessMap = new Map();

	shiftsWithClockTimes.forEach(shift => {
		const { businessId, businessName, businessType, ...shiftData } = shift;

		if (!businessMap.has(businessId)) {
			businessMap.set(businessId, {
				businessId,
				businessName,
				businessType,
				shifts: []
			});
		}

		// Format the shift data
		const formattedShift = {
			shiftId: shiftData.shiftId,
			shiftStart: shiftData.start,
			shiftEnd: shiftData.end,
			employee: {
				employeeId: shiftData.employeeId,
				firstName: shiftData.employeeFirstName,
				lastName: shiftData.employeeLastName,
				jobTitle: shiftData.jobTitle,
				hourlyWage: parseFloat(shiftData.hourlyWage) || 0,
				totalHours: parseFloat(shiftData.totalHours) || 0
			},
			location: shiftData.attractionId ? {
				attractionId: shiftData.attractionId,
				attractionName: shiftData.attractionName,
				attractionLocation: shiftData.attractionLocation
			} : null,
			clockTimes: shiftData.clockTimes.map(ct => ({
				clockTimeId: ct.clockTimeId,
				clockIn: ct.startTime,
				clockOut: ct.endTime
			}))
		};

		businessMap.get(businessId).shifts.push(formattedShift);
	});

	// Convert map to array and sort by business name
	const reports = Array.from(businessMap.values()).sort((a, b) => 
		a.businessName.localeCompare(b.businessName)
	);

	return reports;
}

/**
 * Gets a summary shift report with just the totals
 * Provides a summary without detailed shift information.
 * displays the totals for the business in the report and their shifts and employees as a table containing the business name, type, total shifts, total hours, and total employees.
 * 
 * @param {string[]} req.body.employeeIds - Optional array of specific employee UUIDs
 * @param {string} req.body.businessId - Optional specific business UUID
 * @param {string} req.body.startDate - Optional start date for filtering
 * @param {string} req.body.endDate - Optional end date for filtering
 * 
 * @returns {Promise<Array>} Array of summary reports (without detailed shift arrays)
 */
async function getShiftReportSummary(req, _res) {
	const fullReport = await getShiftReport(req, _res);

	// Remove the detailed shift arrays and add summary statistics
	return fullReport.map(report => {
		const totalShifts = report.shifts.length;
		const totalHours = report.shifts.reduce((sum, shift) => sum + shift.employee.totalHours, 0);
		const uniqueEmployees = new Set(report.shifts.map(shift => shift.employee.employeeId)).size;

		return {
			businessId: report.businessId,
			businessName: report.businessName,
			businessType: report.businessType,
			totalShifts: totalShifts,
			totalHours: parseFloat(totalHours.toFixed(2)),
			uniqueEmployees: uniqueEmployees,
			dateRange: {
				startDate: req.body.startDate || null,
				endDate: req.body.endDate || null
			}
		};
	});
}

/**
 * Gets an aggregated report across all selected businesses.
 * Combines the shift reports of all businesses into a single summary.
 * displays the totals for all businesses in the report and their shifts and employees as a table containing the business name, type, total shifts, total hours, and total employees.
 * 
 * @param {string[]} req.body.employeeIds - Optional array of specific employee UUIDs
 * @param {string} req.body.businessId - Optional specific business UUID
 * @param {string} req.body.startDate - Optional start date for filtering
 * @param {string} req.body.endDate - Optional end date for filtering
 * 
 * @returns {Promise<Object>} Single aggregated report with grand totals
 */
async function getAllBusinessesShiftReport(req, _res) {
	const reports = await getShiftReport(req, _res);

	if (!reports || reports.length === 0) {
		return {
			totalShifts: 0,
			totalHours: 0,
			totalEmployees: 0,
			businessCount: 0,
			dateRange: {
				startDate: req.body.startDate || null,
				endDate: req.body.endDate || null
			}
		};
	}

	const aggregated = reports.reduce(
		(acc, report) => {
			const totalShifts = report.shifts.length;
			const totalHours = report.shifts.reduce((sum, shift) => sum + shift.employee.totalHours, 0);
			const uniqueEmployees = new Set(report.shifts.map(shift => shift.employee.employeeId)).size;

			return {
				totalShifts: acc.totalShifts + totalShifts,
				totalHours: acc.totalHours + totalHours,
				totalEmployees: acc.totalEmployees + uniqueEmployees,
				businessCount: acc.businessCount + 1
			};
		},
		{
			totalShifts: 0,
			totalHours: 0,
			totalEmployees: 0,
			businessCount: 0
		}
	);

	//same deal, floats must be converted to strings with 2 decimal places in order to be returned as JSON.
	return {
		...aggregated,
		totalHours: parseFloat(aggregated.totalHours.toFixed(2)),
		dateRange: {
			startDate: req.body.startDate || null,
			endDate: req.body.endDate || null
		},
		businessDetails: reports.map(r => ({
			businessId: r.businessId,
			businessName: r.businessName,
			businessType: r.businessType,
			totalShifts: r.shifts.length
		}))
	};
}

export default {
	getShiftReport,
	getShiftReportSummary,
	getAllBusinessesShiftReport
};

