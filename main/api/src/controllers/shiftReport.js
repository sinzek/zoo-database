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

	// Derive the set of employees and an expanded time window to fetch candidate clock times
	const employeeSet = Array.from(new Set(shifts.map((s) => s.employeeId)));
	const minShiftStart = new Date(
		shifts.reduce(
			(min, s) => Math.min(min, new Date(s.start).getTime()),
			Infinity
		)
	);
	const maxShiftEnd = new Date(
		shifts.reduce(
			(max, s) => Math.max(max, new Date(s.end).getTime()),
			-Infinity
		)
	);

	// Tolerance window (e.g., 6 hours before/after shift window)
	const PRE_MS = 6 * 60 * 60 * 1000;
	const POST_MS = 6 * 60 * 60 * 1000;

	const expandedStart = new Date(minShiftStart.getTime() - PRE_MS);
	const expandedEnd = new Date(maxShiftEnd.getTime() + POST_MS);

	// Fetch all relevant clock times for those employees in one shot
	let clockTimes = [];
	if (employeeSet.length > 0) {
		const placeholders = employeeSet.map(() => '?').join(', ');
		clockTimes = await query(
			`SELECT clockTimeId, employeeId, startTime, endTime
             FROM EmployeeClockTime
             WHERE employeeId IN (${placeholders})
               AND COALESCE(endTime, NOW()) >= ?
               AND startTime <= ? 
             ORDER BY employeeId, startTime ASC`,
			[...employeeSet, expandedStart, expandedEnd]
		);
	}

	// Group clock times by employee for faster matching
	const clockByEmployee = new Map();
	for (const ct of clockTimes) {
		if (!clockByEmployee.has(ct.employeeId))
			clockByEmployee.set(ct.employeeId, []);
		clockByEmployee.get(ct.employeeId).push(ct);
	}

	// Helper to check overlap with a padded shift window
	function overlapsPadded(
		shiftStart,
		shiftEnd,
		ctStart,
		ctEnd,
		preMs,
		postMs
	) {
		const winStart = new Date(new Date(shiftStart).getTime() - preMs);
		const winEnd = new Date(new Date(shiftEnd).getTime() + postMs);
		const cStart = new Date(ctStart);
		const cEnd = ctEnd ? new Date(ctEnd) : new Date(); // open clock set to now
		return cStart <= winEnd && cEnd >= winStart;
	}

	// Attach clock times to each shift by overlap and employee match
	const shiftsWithClockTimes = shifts.map((shift) => {
		const candidate = clockByEmployee.get(shift.employeeId) || [];
		const matches = candidate.filter((ct) =>
			overlapsPadded(
				shift.start,
				shift.end,
				ct.startTime,
				ct.endTime,
				PRE_MS,
				POST_MS
			)
		);

		// Optional: sort and keep only those with at least minimal overlap
		matches.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

		return {
			...shift,
			clockTimes: matches,
		};
	});

	// Group by business
	const businessMap = new Map();

	shiftsWithClockTimes.forEach((shift) => {
		const { businessId, businessName, businessType, ...shiftData } = shift;

		if (!businessMap.has(businessId)) {
			businessMap.set(businessId, {
				businessId,
				businessName,
				businessType,
				shifts: [],
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
				totalHours: parseFloat(shiftData.totalHours) || 0,
			},
			location: shiftData.attractionId
				? {
						attractionId: shiftData.attractionId,
						attractionName: shiftData.attractionName,
						attractionLocation: shiftData.attractionLocation,
					}
				: null,
			clockTimes: (shiftData.clockTimes || []).map((ct) => ({
				clockTimeId: ct.clockTimeId,
				clockIn: ct.startTime,
				clockOut: ct.endTime,
			})),
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
	return fullReport.map((report) => {
		const totalShifts = report.shifts.length;
		const totalHours = report.shifts.reduce(
			(sum, shift) => sum + shift.employee.totalHours,
			0
		);
		const uniqueEmployees = new Set(
			report.shifts.map((shift) => shift.employee.employeeId)
		).size;

		return {
			businessId: report.businessId,
			businessName: report.businessName,
			businessType: report.businessType,
			totalShifts: totalShifts,
			totalHours: parseFloat(totalHours.toFixed(2)),
			uniqueEmployees: uniqueEmployees,
			dateRange: {
				startDate: req.body.startDate || null,
				endDate: req.body.endDate || null,
			},
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
				endDate: req.body.endDate || null,
			},
		};
	}

	const aggregated = reports.reduce(
		(acc, report) => {
			const totalShifts = report.shifts.length;
			const totalHours = report.shifts.reduce(
				(sum, shift) => sum + shift.employee.totalHours,
				0
			);
			const uniqueEmployees = new Set(
				report.shifts.map((shift) => shift.employee.employeeId)
			).size;

			return {
				totalShifts: acc.totalShifts + totalShifts,
				totalHours: acc.totalHours + totalHours,
				totalEmployees: acc.totalEmployees + uniqueEmployees,
				businessCount: acc.businessCount + 1,
			};
		},
		{
			totalShifts: 0,
			totalHours: 0,
			totalEmployees: 0,
			businessCount: 0,
		}
	);

	//same deal, floats must be converted to strings with 2 decimal places in order to be returned as JSON.
	return {
		...aggregated,
		totalHours: parseFloat(aggregated.totalHours.toFixed(2)),
		dateRange: {
			startDate: req.body.startDate || null,
			endDate: req.body.endDate || null,
		},
		businessDetails: reports.map((r) => ({
			businessId: r.businessId,
			businessName: r.businessName,
			businessType: r.businessType,
			totalShifts: r.shifts.length,
		})),
	};
}

async function getFullShiftReport(req, res) {
	const data = await getShiftReport(req, res);

	if (!data) {
		throw new Error('No data found for full shift report');
	}

	return [data];
}

/**
 * Express handler: Summary shift report
 */
async function getShiftSummaryReport(req, res) {
	const data = await getShiftReportSummary(req, res);

	if (!data) throw new Error('No data found for shift summary report');

	return [data];
}

/**
 * Express handler: Aggregated shift report
 */
async function getAggregatedShiftReport(req, res) {
	const data = await getAllBusinessesShiftReport(req, res);

	if (!data) throw new Error('No data found for aggregated shift report');

	return [data];
}

export default {
	getShiftReport,
	getShiftReportSummary,
	getAllBusinessesShiftReport,
	getFullShiftReport,
	getShiftSummaryReport,
	getAggregatedShiftReport,
};
