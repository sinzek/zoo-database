import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';
import { query } from '../db/mysql.js';

/**
 * Creates a new animal record.
 * @param {*} req - The request object containing the animal data in req.body
 * @param {*} _res - The response object (not used).
 * @returns {Promise<Array>} - An array containing the newly created animal object.
 */
async function createOne(req, _res) {
	const newAnimal = req.body;
	const animalId = crypto.randomUUID();

	const animalData = {
		animalId,
		firstName: newAnimal.firstName,
		lastName: newAnimal.lastName,
		commonName: newAnimal.commonName,
		species: newAnimal.species,
		genus: newAnimal.genus,
		birthDate: newAnimal.birthDate,
		importedFrom: newAnimal.importedFrom,
		importDate: newAnimal.importDate,
		sex: newAnimal.sex,
		behavior: newAnimal.behavior,
		habitatId: newAnimal.habitatId,
	};

	await createOneQuery('Animal', animalData);

	return [animalData];
}

/**
 * Updates an existing animal record.
 * @param {*} req - The request object containing the updated animal data in req.body
 * @param {*} _res - The response object (not used).
 * @returns {Promise<Array>} - An array containing the updated animal object.
 */
async function updateOne(req, _res) {
	const updatedAnimal = req.body;

	if (!updatedAnimal) {
		throw new Error('Missing animal data');
	}

	await updateOneQuery('Animal', updatedAnimal, 'animalId');

	return [updatedAnimal];
}

/**
 * Retrieves a single animal by its ID.
 * @param {string} req.body.findAnimalId - UUID of the animal to retrieve
 * @returns {Promise<Array>} Array containing the animal object
 * @throws If findAnimalId is missing or no animal is found
 */
async function getOneById(req, _res) {
	const { animalId } = req.body;

	if (!animalId) {
		throw new Error('Missing animalId');
	}

	const [animal] = await getNByKeyQuery('Animal', 'animalId', animalId);

	return [animal];
}

async function getNByHabitat(req, _res) {
	const { habitatId } = req.body;

	if (!habitatId) throw new Error('Missing habitatId');

	const animals = await getNByKeyQuery('Animal', 'habitatId', habitatId);

	return [animals];
}

async function getNByHandler(req, _res) {
	//by employeeid
	const { employeeId } = req.body;

	if (!employeeId) throw new Error('Missing employeeId');

	// using query for complex join
	const animals = await query(
		`
		SELECT Animal.*
		FROM Animal, TakesCareOf
		WHERE TakesCareOf.employeeId = ? AND TakesCareOf.animalId = Animal.animalId AND Animal.deletedAt IS NULL;       
		`,
		[employeeId]
	);

	if (!animals || animals.length === 0) {
		throw new Error('No animals found for the given handler');
	}

	return [animals];
}

async function getAllGroupedByHabitat(_req, _res) {
	const rows = await query(
		`
		SELECT Habitat.habitatId, Habitat.name AS habitatName, Animal.*
		FROM Habitat
		LEFT JOIN Animal ON Habitat.habitatId = Animal.habitatId AND Animal.deletedAt IS NULL
		WHERE Habitat.deletedAt IS NULL
		ORDER BY Habitat.habitatId;
		`
	);

	if (!rows || rows.length === 0) {
		throw new Error('No habitats or animals found');
	}

	// group animals by habitat
	const habitatMap = new Map();

	rows.forEach((row) => {
		const habitatId = row.habitatId;
		if (!habitatMap.has(habitatId)) {
			habitatMap.set(habitatId, {
				habitatId: habitatId,
				habitatName: row.habitatName,
				animals: [],
			});
		}
		if (row.animalId) {
			habitatMap.get(habitatId).animals.push({
				animalId: row.animalId,
				firstName: row.firstName,
				lastName: row.lastName,
				commonName: row.commonName,
				behavior: row.behavior,
				species: row.species,
				genus: row.genus,
				birthDate: row.birthDate,
				importedFrom: row.importedFrom,
				importDate: row.importDate,
				imageUrl: row.imageUrl,
			});
		}
	});

	/**
	 * structured as:
	 * [
	 *   {
	 *     habitatId: 'habitat-uuid',
	 *     habitatName: 'Savannah',
	 *     animals: [
	 *       { animalId: 'animal-uuid', firstName: 'Bro', ... },
	 *       { animalId: 'animal-uuid', firstName: 'Dude', ... },
	 *       ...
	 *     ]
	 *   },
	 *   ...
	 * ]
	 */

	return [Array.from(habitatMap.values())];
}

export default {
	createOne,
	updateOne,
	getOneById,
	getNByHabitat,
	getNByHandler,
	getAllGroupedByHabitat,
};
