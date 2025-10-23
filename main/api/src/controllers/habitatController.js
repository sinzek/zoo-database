import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new habitat record in the database.
 * @param {string} req.body.name - Name of the habitat
 * @param {string} req.body.description - Description of the habitat
 * @returns {Promise<Array>} Array containing the created habitat object with generated habitatId
 * @throws {Error} If habitat data is missing
 */
async function createOne(req, _res) {
	const newHabitat = req.body;

	if (!newHabitat) throw new Error('Missing habitat data');

	const habitatId = crypto.randomUUID();

	const habitatData = {
		habitatId,
		name: newHabitat.name,
		description: newHabitat.description,
		deletedAt: null,
	};

	await createOneQuery('Habitat', habitatData);

	return [{ habitatId, ...newHabitat }];
}

/**
 * Retrieves a single habitat by its ID.
 * @param {string} req.body.habitatId - UUID of the habitat to retrieve
 * @returns {Promise<Array>} Array containing the habitat object
 * @throws {Error} If habitatId is missing or no habitat is found
 */
async function getOneById(req, _res) {
	const { habitatId } = req.body;

	if (!habitatId) throw new Error('Missing habitatId');

	const rows = await getNByKeyQuery('Habitat', 'habitatId', habitatId);

	return [rows[0]];
}

/**
 * Retrieves all non-deleted habitats from the database.
 * @returns {Promise<Array>} Array of all habitat objects
 */
async function getAll(_req, _res) {
	// using db.query for getting all habitats
	const { query } = await import('../db/mysql.js');
	
	const rows = await query(
		`
		SELECT *
		FROM Habitat
		WHERE deletedAt IS NULL
		`
	);

	return rows;
}

/**
 * Updates an existing habitat record.
 * @param {string} req.body.habitatId - UUID of the habitat to update
 * @param {string} [req.body.name] - Updated name
 * @param {string} [req.body.description] - Updated description
 * @returns {Promise<Array>} Array containing the updated habitat object
 * @throws {Error} If habitat data or habitatId is missing
 */
async function updateOne(req, _res) {
	const updatedHabitat = req.body;

	if (!updatedHabitat || !updatedHabitat.habitatId) {
		throw new Error('Missing habitat data or habitatId');
	}

	const newHabitatData = { ...updatedHabitat };

	await updateOneQuery('Habitat', newHabitatData, 'habitatId');

	return [updatedHabitat];
}

/**
 * Soft deletes a habitat by setting its deletedAt timestamp.
 * @param {string} req.body.habitatId - UUID of the habitat to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If habitatId is missing
 */
async function deleteOne(req, _res) {
	const { habitatId } = req.body;

	if (!habitatId) throw new Error('Missing habitatId');

	// using db.query for soft delete
	const { db } = await import('../db/mysql.js');

	await db.query(
		`
		UPDATE Habitat
		SET deletedAt = CURRENT_DATE()
		WHERE habitatId = ? AND deletedAt IS NULL
		`,
		[habitatId]
	);

	return [{ message: 'Habitat successfully deleted' }];
}

export default { createOne, getOneById, getAll, updateOne, deleteOne };

