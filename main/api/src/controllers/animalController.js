import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

async function createOne(req, _res){
	const newAnimal = req.body;
	const animalId = crypto.randomUUID();

	// Get a default diet if dietId is not provided
	let dietId = newAnimal.dietId;
	if (!dietId) {
		// Get the first available diet or create a default one
		const defaultDiets = await query(
			`SELECT dietId FROM Diet WHERE deletedAt IS NULL LIMIT 1`
		);
		if (defaultDiets && defaultDiets.length > 0) {
			dietId = defaultDiets[0].dietId;
		} else {
			throw new Error('No diet available. Please create a diet first.');
		}
	}

	const animalData = {
		animalId,
		firstName: newAnimal.firstName,
		lastName: newAnimal.lastName || null,
		commonName: newAnimal.commonName,
		species: newAnimal.species,
		genus: newAnimal.genus,
		birthDate: newAnimal.birthDate,
		importedFrom: newAnimal.importedFrom || null,
		importDate: newAnimal.importDate || null,
		sex: newAnimal.sex,
		behavior: newAnimal.behavior || null,
		habitatId: newAnimal.habitatId,
		dietId: dietId,
	};


	await createOneQuery('Animal', animalData);
	return [{animalId, ...animalData}];
}

async function updateOne(req, _res){
	const updatedAnimal = req.body;

	if (!updatedAnimal || !updatedAnimal.animalId) {
		throw new Error('Missing animal data or animalId');
	}

	// Extract fields we want to update, explicitly keeping animalId
	const animalUpdateData = {
		animalId: updatedAnimal.animalId,
		firstName: updatedAnimal.firstName,
		lastName: updatedAnimal.lastName || null,
		commonName: updatedAnimal.commonName,
		species: updatedAnimal.species,
		genus: updatedAnimal.genus,
		birthDate: updatedAnimal.birthDate,
		deathDate: updatedAnimal.deathDate || null,
		importedFrom: updatedAnimal.importedFrom || null,
		importDate: updatedAnimal.importDate || null,
		sex: updatedAnimal.sex,
		behavior: updatedAnimal.behavior || null,
		habitatId: updatedAnimal.habitatId,
		imageUrl: updatedAnimal.imageUrl || null,
	};
	
	await updateOneQuery('Animal', animalUpdateData, 'animalId');

	return [animalUpdateData];
}

async function getOneById(req, _res) {
	const {findAnimalId} = req.body; 
	if(!findAnimalId) {
		throw new Error('Missing animal ID');
	}
	const rows = await getNByKeyQuery('Animal', 'animalId', findAnimalId);

	return [rows[0]];
}

async function getManyByHabitat(req, _res){
	const requestedHabitat = req.body;
	const habitatId = requestedHabitat.habitatId;

	if (!habitatId) throw new Error('Missing habitatId');

	const rows = await getNByKeyQuery('Animal', 'habitatId', habitatId);
	
	return rows;
}

async function getManyByHandler(req, _res){ //by employeeid
	const handlerInfo = req.body;

	if (!handlerInfo.EmployeeId) throw new Error('Missing EmployeeId');

	// using db.query for complex join query
	const rows = await db.query(
		`
		SELECT Animal.*
		FROM Animal, TakesCareOf
		WHERE TakesCareOf.employeeID = ? AND TakesCareOf.animalID = Animal.animalID AND Animal.deletedAt IS NULL;       
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
				deathDate: row.deathDate,
				importedFrom: row.importedFrom,
				importDate: row.importDate,
				sex: row.sex,
				habitatId: row.habitatId,
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
