
import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';
import { query } from '../db/mysql.js';

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

	return [animalData];
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
 * @throws {Error} If findAnimalId is missing or no animal is found
 */
async function getOneById(req, _res) {
	const { animalId } = req.body; 

	if(!animalId) {
		throw new Error('Missing animalId');
	}

	const [animal] = await getNByKeyQuery('Animal', 'animalId', animalId);

	return [animal];
}

<<<<<<< HEAD
async function getNByHabitat(req, _res){
	const { habitatId } = req.body;
=======
/**
 * Retrieves all animals in a specific habitat.
 * @param {string} req.body.habitatId - UUID of the habitat
 * @returns {Promise<Array>} Array of animal objects
 * @throws {Error} If habitatId is missing or no animals are found
 */
async function getManyByHabitat(req, _res){
	const requestedHabitat = req.body;
	const habitatId = requestedHabitat.habitatId;
>>>>>>> 4ed02300af42ef4f085b3ec216adde082ab7d07f

	if (!habitatId) throw new Error('Missing habitatId');

	const animals = await getNByKeyQuery('Animal', 'habitatId', habitatId);
	
	return animals;
}

<<<<<<< HEAD
async function getNByHandler(req, _res){ //by employeeid
	const { employeeId } = req.body;
=======
/**
 * Retrieves all animals assigned to a specific handler/employee.
 * @param {string} req.body.EmployeeId - UUID of the employee/handler
 * @returns {Promise<Array>} Array of animal objects with handler information
 * @throws {Error} If EmployeeId is missing
 */
async function getManyByHandler(req, _res){ //by employeeid
	const handlerInfo = req.body;
>>>>>>> 4ed02300af42ef4f085b3ec216adde082ab7d07f

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

	if(!animals || animals.length === 0) {
		throw new Error('No animals found for the given handler');
	}

	return animals;
}


<<<<<<< HEAD
export default { createOne, updateOne, getOneById, getNByHabitat, getNByHandler };
=======
export default {createOne, updateOne, getOneById, getManyByHabitat, getManyByHandler};
>>>>>>> 4ed02300af42ef4f085b3ec216adde082ab7d07f
