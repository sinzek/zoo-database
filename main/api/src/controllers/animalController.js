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

async function updateOne(req, _res){
	const updatedAnimal = req.body;

	if (!updatedAnimal || !updatedAnimal.animalId) {
		throw new Error('Missing animal data or animalId');
	}

	const newAnimalData = {...updatedAnimal};
	await updateOneQuery('Animal', newAnimalData, 'animalId');

	return [updatedAnimal];
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
		[handlerInfo.EmployeeId]
	);

	return rows;
}


export default {createOne, updateOne, getOneById, getManyByHabitat, getManyByHandler};