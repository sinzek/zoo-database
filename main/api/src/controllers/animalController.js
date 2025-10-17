import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import crypto from 'crypto';

async function createAnimal(req, res){
	const newAnimal = req.body;

	const {firstName, lastName, commonName, species, genus, birthDate, importedFrom, importDate, sex, behavior, habitatID} = newAnimal;

		const newAnimalUUID = crypto.randomUUID();

		await db.query(
			`
			INSERT INTO Animal (animalId, firstName, lastName, commonName, species, genus, birthDate, importedFrom, importDate, sex, behavior, habitatId)
			VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
			`,
			[newAnimalUUID, firstName, lastName, commonName, species, genus, birthDate, importedFrom, importDate, sex, behavior, habitatID]
		);

		//select data that you want the user to see
		const [result] = await db.query(
			`
			SELECT *
			FROM Animal
			WHERE animalID = ? AND deletedAt IS NULL
			`,
			[newAnimalUUID]
		);


		return sendJSON(
			res,
			201,
			{animal: result[0]}
		);
}

async function updateAnimal(req, res){
	//body has ALL the attributes, on the frontend their default values are set to the values on the db. we just check differences?
	const updatedAnimal = req.body;
	
	const {animalId, firstName, lastName, commonName, species, genus, birthDate, deathDate, importedFrom, importDate, sex, behavior} = updatedAnimal;

//what if animal dont exist?
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

async function getAnimalByID(req, res){
	//you can get an animal many ways, but in the frontend, it queries based on some "filter", ie; only show me animals living in X habitat. Clicking on them returns the animalID.
	const findAnimal = req.body; //findAnimal only has the animalID
	const findAnimalID = findAnimal.animalID;
		const [result] = await db.query(`
			SELECT *
			FROM Animal
			WHERE AnimalID = ? AND deletedAt IS NULL
			`,
		[
			findAnimalID
		]);
		
		const foundAnimal = result[0];
		return sendJSON(res,
			201,
			{foundAnimal}
		);
}

async function getAnimalByHabitat(req, res){
	const requestedHabitat = req.body;
	const habitatID = requestedHabitat.habitatID;
	const [result] = await db.query(
			`
				SELECT *
				FROM Animal
				WHERE habitatId = ? AND deletedAt IS NULL
			`,
			[
				habitatID
			]
	);
	return sendJSON(res,
		201,
		{result}
	);
}

async function getAnimalByHandler(req, res){ //by employeeid
	const handlerInfo = req.body;

	const [AnimalsTakenCareBy] = await db.query(
		`
		SELECT Animal.*
		FROM Animal, TakesCareOf
		WHERE TakesCareOf.employeeID = ? AND TakesCareOf.animalID = Animal.animalID AND Animal.deletedAt IS NULL;       
		`,
		[
			handlerInfo.EmployeeId
		]
	);

	return sendJSON(res,
		400,
		{
			AnimalsTakenCareBy
		}
	)
}

export default {createAnimal, updateAnimal, getAnimalByID, getAnimalByHandler, getAnimalByHabitat};