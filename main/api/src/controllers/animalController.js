import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new animal record.
 * @param {string} req.body.firstName - First name of the animal
 * @param {string} [req.body.lastName] - Last name of the animal
 * @param {string} req.body.commonName - Common name of the animal
 * @param {string} req.body.species - Species of the animal
 * @param {string} req.body.genus - Genus of the animal
 * @param {string} req.body.birthDate - Birth date of the animal
 * @param {string} [req.body.importedFrom] - Location imported from
 * @param {string} [req.body.importDate] - Date imported
 * @param {string} req.body.sex - Sex of the animal ('male' or 'female')
 * @param {string} [req.body.behavior] - Behavioral notes
 * @param {string} req.body.habitatId - UUID of the habitat
 * @returns {Promise<Array>} Array containing the created animal object with generated animalId
 */
async function createOne(req, _res){
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
		habitatId: newAnimal.habitatId
	};


	await createOneQuery('Animal', animalData);
	return [{animalId, ...animalData}];
}

/**
 * Updates an existing animal record.
 * @param {string} req.body.animalId - UUID of the animal to update
 * @param {string} [req.body.firstName] - Updated first name
 * @param {string} [req.body.lastName] - Updated last name
 * @param {string} [req.body.commonName] - Updated common name
 * @param {string} [req.body.behavior] - Updated behavior notes
 * @param {string} [req.body.habitatId] - Updated habitat ID
 * @returns {Promise<Array>} Array containing the updated animal object
 * @throws {Error} If animal data or animalId is missing
 */
async function updateOne(req, _res){
	const updatedAnimal = req.body;

	if (!updatedAnimal || !updatedAnimal.animalId) {
		throw new Error('Missing animal data or animalId');
	}

	const newAnimalData = {...updatedAnimal};
	await updateOneQuery('Animal', newAnimalData, 'animalId');

	return [updatedAnimal];
}

/**
 * Retrieves a single animal by its ID.
 * @param {string} req.body.findAnimalId - UUID of the animal to retrieve
 * @returns {Promise<Array>} Array containing the animal object
 * @throws {Error} If findAnimalId is missing or no animal is found
 */
async function getOneById(req, _res) {
	const {findAnimalId} = req.body; 
	if(!findAnimalId) {
		throw new Error('Missing animal ID');
	}
	const rows = await getNByKeyQuery('Animal', 'animalId', findAnimalId);

	return [rows[0]];
}

/**
 * Retrieves all animals in a specific habitat.
 * @param {string} req.body.habitatId - UUID of the habitat
 * @returns {Promise<Array>} Array of animal objects
 * @throws {Error} If habitatId is missing or no animals are found
 */
async function getManyByHabitat(req, _res){
	const requestedHabitat = req.body;
	const habitatId = requestedHabitat.habitatId;

	if (!habitatId) throw new Error('Missing habitatId');

	const rows = await getNByKeyQuery('Animal', 'habitatId', habitatId);
	
	return rows;
}

/**
 * Retrieves all animals assigned to a specific handler/employee.
 * @param {string} req.body.EmployeeId - UUID of the employee/handler
 * @returns {Promise<Array>} Array of animal objects with handler information
 * @throws {Error} If EmployeeId is missing
 */
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
		[handlerInfo.EmployeeId]
	);

	return rows;
}


export default {createOne, updateOne, getOneById, getManyByHabitat, getManyByHandler};
