import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import crypto from 'crypto';

async function createOne(req, res){
	const newAnimal = req.body;

	const {
		firstName,
		lastName,
		commonName,
		species,
		genus,
		birthDate,
		importedFrom,
		importDate,
		sex,
		behavior,
		habitatId,
	} = newAnimal;

		const newAnimalUUID = crypto.randomUUID();

		const [result] = await db.query(
			`
			INSERT INTO Animal (animalID, firstName, lastName, commonName, species, genus, birthDate, importedFrom, importDate, sex, behavior, habitatId)
			VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);	
			`,
			[newAnimalUUID, firstName, lastName, commonName, species, genus, birthDate, importedFrom, importDate, sex, behavior, habitatId]
		);

		return sendJSON(
			res,
			201,
			{animal: result[0]}
		);
}

async function updateOne(req, res){
	const updatedAnimal = req.body;
	const {
		animalId,
		firstName,
		lastName,
		commonName,
		species,
		genus,
		birthDate,
		deathDate,
		importedFrom,
		importDate,
		sex,
		behavior,
	} = updatedAnimal;

	const [result] = await db.query(
		`
			UPDATE Animal
			SET firstName = ?, lastName = ?, commonName = ?, species = ?, genus = ?, birthDate = ?, deathDate = ?, importedFrom = ?, importDate = ?, sex = ?, behavior = ?
			WHERE animalID = ? AND deletedAt IS NULL;
		`,
		[firstName, lastName, commonName, species, genus, birthDate, deathDate, importedFrom, importDate, sex, behavior, animalId]
	);

		const animal = result[0];
		return sendJSON(
			res,
			201,
			{animal}
		)
}

async function getOneById(req, res) {
	const findAnimal = req.body; 

	const findAnimalId = findAnimal.animalId;
		const [result] = await db.query(`
			SELECT *
			FROM Animal
			WHERE AnimalId = ?
			WHERE AnimalID = ? AND deletedAt IS NULL
			`,
			[findAnimalId]
		);

		const foundAnimal = result[0];
		return sendJSON(res, 201, { foundAnimal });
}
async function getManyByHabitat(req, res){
	const requestedHabitat = req.body;
	const habitatId = requestedHabitat.habitatId;
	const [result] = await db.query(
			`
				SELECT *
				FROM Animal
				WHERE habitatId = ? AND deletedAt IS NULL
			`,
			[habitatId]
		);
	return sendJSON(res,
		201,
		{result}
	);
}

async function getManyByHandler(req, res){ //by employeeid
	const handlerInfo = req.body;

	const [AnimalsTakenCareBy] = await db.query(
		`
		SELECT Animal.*
		FROM Animal, TakesCareOf
		WHERE TakesCareOf.employeeId = ?
		WHERE TakesCareOf.employeeID = ? AND TakesCareOf.animalID = Animal.animalID AND Animal.deletedAt IS NULL;       
		`,
		[handlerInfo.EmployeeId]
	);

	return sendJSON(res, 400, {
		AnimalsTakenCareBy,
	});
}


export default {createOne, updateOne, getOneById, getManyByHabitat, getManyByHandler};