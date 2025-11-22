import { query } from '../db/mysql.js';

/**
 * Generates a comprehensive animal report with medical records, diet, and handler information.
 * 
 * @param {string[]} req.body.animalIds - Optional array of specific animal UUIDs
 * @param {string} req.body.habitatId - Optional habitat ID to filter by
 * @param {string} req.body.handlerId - Optional handler/employee ID to filter by
 * 
 * @returns {Promise<Array>} Array of animal objects with:
 *   - Animal details (name, species, etc.)
 *   - Habitat information
 *   - Handlers (array of employees)
 *   - Medical records (array)
 *   - Diet with schedule (array of schedule days)
 */
async function getAnimalReport(req, _res) {
	const { animalIds, habitatId, handlerId } = req.body;

	// Build WHERE clause for animal filtering
	let animalWhereClause = 'WHERE a.deletedAt IS NULL';
	let animalParams = [];

	if (animalIds && Array.isArray(animalIds) && animalIds.length > 0) {
		// Filter by specific animal IDs
		const placeholders = animalIds.map(() => '?').join(', ');
		animalWhereClause += ` AND a.animalId IN (${placeholders})`;
		animalParams = [...animalIds];
	} else if (habitatId) {
		// Filter by habitat
		animalWhereClause += ' AND a.habitatId = ?';
		animalParams = [habitatId];
	} else if (handlerId) {
		// Filter by handler - need to join with TakesCareOf
		animalWhereClause += ' AND a.animalId IN (SELECT animalId FROM TakesCareOf WHERE employeeId = ?)';
		animalParams = [handlerId];
	}

	// Main query to get animals with habitat
	const animalQuery = `
		SELECT 
			a.animalId,
			a.firstName,
			a.lastName,
			a.commonName,
			a.species,
			a.genus,
			a.birthDate,
			a.deathDate,
			a.importedFrom,
			a.importDate,
			a.sex,
			a.behavior,
			a.imageUrl,
			h.habitatId,
			h.name as habitatName,
			h.description as habitatDescription
		FROM Animal a
		LEFT JOIN Habitat h ON a.habitatId = h.habitatId AND h.deletedAt IS NULL
		${animalWhereClause}
		ORDER BY a.commonName, a.firstName
	`;

	console.log('Animal query:', animalQuery);
	console.log('Animal params:', animalParams);

	const animals = await query(animalQuery, animalParams);
	console.log('Animals found:', animals.length);

	// For each animal, get handlers, medical records, and diet
	const reports = await Promise.all(
		animals.map(async (animal) => {
			// animal handlers
			const handlersQuery = `
				SELECT 
					e.employeeId,
					e.firstName,
					e.lastName,
					e.accessLevel,
					e.jobTitle
				FROM Employee e
				INNER JOIN TakesCareOf tco ON e.employeeId = tco.employeeId
				WHERE tco.animalId = ? AND e.deletedAt IS NULL
			`;
			const handlers = await query(handlersQuery, [animal.animalId]);

			// med records
			const medicalRecordsQuery = `
				SELECT 
					medicalRecordId,
					veterinarianNotes,
					reasonForVisit,
					visitDate,
					checkoutDate
				FROM MedicalRecord
				WHERE animalId = ? AND deletedAt IS NULL
				ORDER BY visitDate DESC
			`;
			const medicalRecords = await query(medicalRecordsQuery, [animal.animalId]);

			// diet and schedule
			const dietQuery = `
				SELECT 
					d.dietId,
					d.specialNotes,
					dsd.dietScheduleDayId,
					dsd.dayOfWeek,
					dsd.feedTime,
					dsd.food
				FROM Diet d
				LEFT JOIN DietScheduleDay dsd ON d.dietId = dsd.dietId
				WHERE d.animalId = ? AND d.deletedAt IS NULL
				ORDER BY dsd.dayOfWeek, dsd.feedTime
			`;
			const dietRows = await query(dietQuery, [animal.animalId]);

			// Organize diet data
			const dietSchedules = [];
			const scheduleMap = new Map();
			
			// Group schedule days by diet
			dietRows.forEach(row => {
				if (row.dietId) {
					if (!scheduleMap.has(row.dietId)) {
						scheduleMap.set(row.dietId, {
							dietId: row.dietId,
							specialNotes: row.specialNotes,
							schedule: []
						});
					}
					
					if (row.dietScheduleDayId) {
						scheduleMap.get(row.dietId).schedule.push({
							dayOfWeek: row.dayOfWeek,
							feedTime: row.feedTime,
							food: row.food
						});
					}
				}
			});

			dietSchedules.push(...Array.from(scheduleMap.values()));

			return {
				...animal,
				handlers: handlers || [],
				medicalRecords: medicalRecords || [],
				dietSchedules: dietSchedules || []
			};
		})
	);

	return [reports];
}

export default {
	getAnimalReport,
};
