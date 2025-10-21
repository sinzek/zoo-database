import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import { validateStrings, determineEmptyFields } from '../utils/auth-utils.js';
import crypto from 'crypto';

async function createOne(req, res) {
	const newAnimal = req.body;

	if (!newAnimal || typeof newAnimal !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}

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

	//stop code injection
	if (
		!validateStrings(
			firstName,
			lastName,
			commonName,
			species,
			genus,
			behavior,
			importedFrom
		)
	) {
		return sendJSON(res, 400, {
			error: 'Missing required fields',
			affectedFields: determineEmptyFields(newAnimal),
		});
	}
	//Code to validate dates? validate that birthDate not in future and same for importdate
	try {
		const newAnimalUUId = crypto.randomUUId();

		await db.query(
			`
			INSERT INTO Animal (animalId, firstName, lastName, commonName, species, genus, birthDate, importedFrom, importDate, sex, behavior, habitatId)
			VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
			`,
			[
				newAnimalUUId,
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
			]
		);

		//select data that you want the user to see
		const [result] = await db.query(
			`
			SELECT *
			FROM Animal
			WHERE animalId = ?
			`,
			[newAnimalUUId]
		);

		if (result.length === 0) {
			//bro what happened we just inserted
			throw new Error('Newly created animal is not found');
		}
		const newAnimal = result[0];

		return sendJSON(res, 201, { animal: newAnimal });
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			return sendJSON(res, 409, {
				error: 'Animal already exists',
				affectedFields: ['animalUUId'],
			});
		}
	}
}

async function updateOne(req, res) {
	//body has ALL the attributes, on the frontend their default values are set to the values on the db. we just check differences?
	const updatedAnimal = req.body;

	if (!updatedAnimal || typeof updatedAnimal !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}
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
	if (
		!validateStrings(
			firstName,
			lastName,
			commonName,
			species,
			genus,
			behavior,
			importedFrom
		)
	) {
		return sendJSON(res, 400, {
			error: 'Missing required fields',
			affectedFields: determineEmptyFields(updatedAnimal),
		});
	}

	//what if animal dont exist?
	try {
		const [result] = await db.query(
			`
				UPDATE Animal
				SET firstName = ?, lastName = ?, commonName = ?, species = ?, genus = ?, birthDate = ?, deathDate = ?, importedFrom = ?, importDate = ?, sex = ?, behavior = ?
				WHERE animalId = ?;
			`,
			[
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
				animalId,
			]
		);

		const updatedAnimal = result[0];

		return sendJSON(res, 201, { updatedAnimal });
	} catch (err) {
		//what error code does an invalid query show?
		return sendJSON(res, 404, {
			error: 'Attempted to update an animal not found',
		});
	}
}

async function getOneById(req, res) {
	//you can get an animal many ways, but in the frontend, it queries based on some "filter", ie; only show me animals living in X habitat. Clicking on them returns the animalId.
	const findAnimal = req.body; //findAnimal only has the animalId

	if (!findAnimal || typeof findAnimal !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}
	const findAnimalId = findAnimal.animalId;
	try {
		const [result] = await db.query(
			`
			SELECT *
			FROM Animal
			WHERE AnimalId = ?
			`,
			[findAnimalId]
		);

		if (result.length === 0) {
			throw new Error('Animal is not found');
		}

		const foundAnimal = result[0];
		return sendJSON(res, 201, { foundAnimal });
	} catch (err) {
		return sendJSON(res, 404, {
			error: 'Could not find animal',
		});
	}
}

async function getOneByHabitatId(req, res) {
	const requestedHabitat = req.body;
	if (!requestedHabitat || typeof requestedHabitat !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}
	const habitatId = requestedHabitat.habitatId;
	try {
		const [result] = await db.query(
			`
				SELECT *
				FROM Animal
				WHERE habitatId = ?
			`,
			[habitatId]
		);
		//don't have to seperate checking for a valid habitat and checking for if there are any animals in said habitat.
		if (result.length === 0) {
			//no animals in habitat
			return sendJSON(res, 404, 'No animals found in habitat.');
		}
	} catch (_err) {
		//uh what error do i throw?
	}
}

async function getOneByEmployeeId(req, res) {
	//by employeeid
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
		WHERE TakesCareOf.employeeId = ?
		`,
		[handlerInfo.EmployeeId]
	);

	return sendJSON(res, 400, {
		AnimalsTakenCareBy,
	});
}

export default {
	createOne,
	updateOne,
	getOneById,
	getOneByHabitatId,
	getOneByEmployeeId,
};
