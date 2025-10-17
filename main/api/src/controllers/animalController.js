import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import { validateStrings, determineEmptyFields} from '../utils/auth-utils.js';
import crypto from 'crypto';

async function createAnimal(req, res){
	const newAnimal = req.body;

	if (!newAnimal || typeof newAnimal !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}

	const {firstName, lastName, commonName, species, genus, birthDate, importedFrom, importDate, sex, behavior, habitatID} = newAnimal;

	//stop code injection
	if (
		!validateStrings(firstName, lastName, commonName, species, genus, behavior, importedFrom)
	) {
		return sendJSON(res, 400, {
			error: 'Missing required fields',
			affectedFields: determineEmptyFields(newAnimal),
		});
	}
	//Code to validate dates? validate that birthDate not in future and same for importdate
	try{
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
			WHERE animalID = ?
			`,
			[newAnimalUUID]
		);

		if(result.length === 0){
			//bro what happened we just inserted
			throw new Error('Newly created animal is not found');
		}
		const newAnimal = result[0];

		return sendJSON(
			res,
			201,
			{animal: newAnimal}
		);
	}
	catch(err){
		if (err.code === 'ER_DUP_ENTRY') {
			return sendJSON(res, 409, {
				error: 'Animal already exists',
				affectedFields: ['animalUUID'],
			});
		}
	}
}

async function updateAnimal(req, res){
	//body has ALL the attributes, on the frontend their default values are set to the values on the db. we just check differences?
	const updatedAnimal = req.body;

	if (!updatedAnimal || typeof updatedAnimal !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}
	const {animalId, firstName, lastName, commonName, species, genus, birthDate, deathDate, importedFrom, importDate, sex, behavior} = updatedAnimal;
	if (
		!validateStrings(firstName, lastName, commonName, species, genus, behavior, importedFrom)
	) {
		return sendJSON(res, 400, {
			error: 'Missing required fields',
			affectedFields: determineEmptyFields(updateAnimal),
		});
	}

	//what if animal dont exist?
	try{
		const [result] = await db.query(
			`
				UPDATE Animal
				SET firstName = ?, lastName = ?, commonName = ?, species = ?, genus = ?, birthDate = ?, deathDate = ?, importedFrom = ?, importDate = ?, sex = ?, behavior = ?
				WHERE animalID = ?;
			`,
			[firstName, lastName, commonName, species, genus, birthDate, deathDate, importedFrom, importDate, sex, behavior, animalId]
		);

		const updatedAnimal = result[0];

		return sendJSON(
			res,
			201,
			{updatedAnimal}
		)
	}
	catch(err){
		//what error code does an invalid query show?
			return sendJSON(res, 404, {
			error: 'Attempted to update an animal not found',
		});
	}
}

async function getAnimalByID(req, res){
	//you can get an animal many ways, but in the frontend, it queries based on some "filter", ie; only show me animals living in X habitat. Clicking on them returns the animalID.
	const findAnimal = req.body; //findAnimal only has the animalID

	if (!findAnimal || typeof findAnimal !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}
	const findAnimalID = findAnimal.animalID;
	try{
		const [result] = await db.query(`
			SELECT *
			FROM Animal
			WHERE AnimalID = ?
			`,
		[
			findAnimalID
		]);

		if(result.length === 0){
			throw new Error('Animal is not found');
		}
		
		const foundAnimal = result[0];
		return sendJSON(res,
			201,
			{foundAnimal}
		);

	}catch(err){
		return sendJSON(res,
			404,
			{
				error: "Could not find animal"
			}
		);
	}
}

async function getAnimalByHabitat(req, res){
	const requestedHabitat = req.body;
	if (!requestedHabitat || typeof requestedHabitat !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}
	const habitatID = requestedHabitat.habitatID;
	try{
		const [result] = await db.query(
			`
				SELECT *
				FROM Animal
				WHERE habitatId = ?
			`,
			[
				habitatID
			]
		);
		//don't have to seperate checking for a valid habitat and checking for if there are any animals in said habitat.
		if(result.length === 0){
			//no animals in habitat
			return sendJSON(
				res,
				404,
				"No animals found in habitat."
			);
		}
	}
	catch(_err){
		//uh what error do i throw?
	}
}

async function getAnimalByHandler(req, res){ //by employeeid
	//TO-DO: Make sure to add security to this, cant think of the cases atm
	const handlerInfo = req.body;
	if (!handlerInfo || typeof handlerInfo !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}
	//first check if it is a valid employee.
	const [AnimalsTakenCareBy] = await db.query(
		`
		SELECT Animal.*
		FROM Animal, TakesCareOf
		WHERE TakesCareOf.employeeID = ?
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

export default {createAnimal, updateAnimal, getAnimalByID, getAnimalByHandler};