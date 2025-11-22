import { query } from '../db/mysql.js';

/**
 * Generates a comprehensive diet report showing all scheduled feedings.
 * 
 * Returns all diet schedule entries ordered by day of week and feed time,
 * with animal, habitat, and handler information.
 * 
 * @returns {Promise<Array>} Array of diet schedule entries with:
 *   - Day of week
 *   - Feed time
 *   - Animal name
 *   - Food
 *   - Habitat name
 *   - Handler(s)
 */
async function getDietReport(req, _res) {
	const { habitatId } = req.body;

	// Build WHERE clause
	let whereClause = 'WHERE a.deletedAt IS NULL AND d.deletedAt IS NULL AND h.deletedAt IS NULL';
	const params = [];

	if (habitatId) {
		whereClause += ' AND h.habitatId = ?';
		params.push(habitatId);
	}

	// Query to get all diet schedule entries with related information
	const dietReportQuery = `
		SELECT 
			dsd.dayOfWeek,
			dsd.feedTime,
			dsd.food,
			a.animalId,
			a.firstName,
			a.lastName,
			a.commonName,
			h.habitatId,
			h.name as habitatName,
			d.dietId,
			d.specialNotes
		FROM DietScheduleDay dsd
		INNER JOIN Diet d ON dsd.dietId = d.dietId
		INNER JOIN Animal a ON d.animalId = a.animalId
		INNER JOIN Habitat h ON a.habitatId = h.habitatId
		${whereClause}
		ORDER BY 
			FIELD(dsd.dayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
			dsd.feedTime,
			a.commonName,
			a.firstName
	`;

	const dietRows = await query(dietReportQuery, params);

	// For each diet entry, get the handlers
	const reports = await Promise.all(
		dietRows.map(async (row) => {
			// Get handlers for this animal
			const handlersQuery = `
				SELECT 
					e.employeeId,
					e.firstName,
					e.lastName,
					e.jobTitle
				FROM Employee e
				INNER JOIN TakesCareOf tco ON e.employeeId = tco.employeeId
				WHERE tco.animalId = ? AND e.deletedAt IS NULL
				ORDER BY e.firstName, e.lastName
			`;
			const handlers = await query(handlersQuery, [row.animalId]);

			return {
				dayOfWeek: row.dayOfWeek,
				feedTime: row.feedTime,
				food: row.food,
				animalId: row.animalId,
				animalName: `${row.firstName}${row.lastName ? ' ' + row.lastName : ''}`,
				commonName: row.commonName,
				habitatId: row.habitatId,
				habitatName: row.habitatName,
				dietId: row.dietId,
				specialNotes: row.specialNotes,
				handlers: handlers || []
			};
		})
	);

	return [reports];
}

export default {
	getDietReport,
};

