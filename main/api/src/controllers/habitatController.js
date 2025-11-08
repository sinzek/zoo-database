import crypto from 'crypto';
import {
	createOneQuery,
	getAllQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';
import { query } from '../db/mysql.js';

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
		imageUrl: newHabitat.imageUrl || null,
		extraDetails: newHabitat.extraDetails || null,
		climate: newHabitat.climate || null,
		funFact: newHabitat.funFact || null,
		deletedAt: null,
	};

	await createOneQuery('Habitat', habitatData);

	return [habitatData];
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

	const [habitat] = await getNByKeyQuery('Habitat', 'habitatId', habitatId);

	try {
		const associatedAnimals = await getNByKeyQuery(
			'Animal',
			'habitatId',
			habitatId
		);

		return [{ habitat, associatedAnimals }];
	} catch {
		return [{ habitat, associatedAnimals: [] }];
	}
}

/**
 * Retrieves all non-deleted habitats from the database.
 * @returns {Promise<Array>} Array of all habitat objects
 */
async function getAll(_req, _res) {
	const habitats = await getAllQuery('Habitat');

	return [habitats];
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
 * Gets the count of animals in a habitat
 * @param {string} req.body.habitatId - UUID of the habitat
 * @returns {Promise<Array>} Array containing animal count
 */
async function getAnimalCount(req, _res) {
	const { habitatId } = req.body;

	if (!habitatId) throw new Error('Missing habitatId');

	const result = await query(
		`SELECT COUNT(*) as count FROM Animal WHERE habitatId = ? AND deletedAt IS NULL`,
		[habitatId]
	);

	return [result[0] || { count: 0 }];
}

/**
 * Soft deletes a habitat by setting its deletedAt timestamp.
 * Allows deletion even if animals are assigned - those animals remain in the database
 * but will be in an "archived" habitat.
 * @param {string} req.body.habitatId - UUID of the habitat to delete
 * @returns {Promise<Array>} Array containing success message and count of affected animals
 */
async function deleteOne(req, _res) {
	const { habitatId } = req.body;

	if (!habitatId) throw new Error('Missing habitatId');

	// Get count of animals in this habitat (for info message)
	const animalCount = await query(
		`SELECT COUNT(*) as count FROM Animal WHERE habitatId = ? AND deletedAt IS NULL`,
		[habitatId]
	);

	const affectedAnimals = animalCount[0]?.count || 0;

	// Soft delete the habitat
	await query(
		`
		UPDATE Habitat
		SET deletedAt = CURRENT_DATE()
		WHERE habitatId = ? AND deletedAt IS NULL
		`,
		[habitatId]
	);

	let message = 'Habitat successfully archived.';
	if (affectedAnimals > 0) {
		message += ` ${affectedAnimals} animal(s) remain in this archived habitat. You may reassign them to active habitats from the Animals page.`;
	}

	return [{ message, affectedAnimals }];
}

/**
 * Retrieves all habitats from the database, including soft-deleted ones.
 * Used for administrators who need to see archived habitats.
 * @returns {Promise<Array>} Array of all habitat objects (including deleted)
 */
async function getAllIncludingDeleted(_req, _res) {
	const habitats = await query(
		`SELECT * FROM Habitat ORDER BY deletedAt IS NULL DESC, name ASC`
	);

	return [habitats];
}

export default {
	createOne,
	getOneById,
	getAll,
	getAllIncludingDeleted,
	updateOne,
	deleteOne,
	getAnimalCount,
};
