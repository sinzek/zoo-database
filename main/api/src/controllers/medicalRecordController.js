import crypto from 'crypto';
import { query } from '../db/mysql.js';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new medical record.
 * @param {string} [req.body.veterinarianNotes] - Notes from the veterinarian
 * @param {string} req.body.reasonForVisit - Reason for the medical visit
 * @param {string} [req.body.animalId] - UUID of the animal being treated
 * @param {string} req.body.visitDate - Date/time of the visit
 * @param {string} [req.body.checkoutDate] - Date/time of checkout (null if still in care)
 * @returns {Promise<Array>} Array containing the created medical record with generated medicalRecordId
 * @throws {Error} If medical record data is missing
 */
async function createOne(req, _res) {
	const newRecord = req.body;

	if (!newRecord) throw new Error('Missing medical record data');

	const medicalRecordId = crypto.randomUUID();

	const recordData = {
		medicalRecordId,
		veterinarianNotes: newRecord.veterinarianNotes || null,
		reasonForVisit: newRecord.reasonForVisit,
		animalId: newRecord.animalId || null,
		visitDate: newRecord.visitDate,
		checkoutDate: newRecord.checkoutDate || null,
		deletedAt: null,
	};

	await createOneQuery('MedicalRecord', recordData);

	return [recordData];
}

/**
 * Retrieves a single medical record by its ID.
 * @param {string} req.body.medicalRecordId - UUID of the medical record to retrieve
 * @returns {Promise<Array>} Array containing the medical record object
 * @throws {Error} If medicalRecordId is missing or no record is found
 */
async function getOneById(req, _res) {
	const { medicalRecordId } = req.body;

	console.log('CREATING NEW MEDICAL RECORD:', medicalRecordId);

	if (!medicalRecordId) throw new Error('Missing medicalRecordId');

	const [medicalRecord] = await getNByKeyQuery(
		'MedicalRecord',
		'medicalRecordId',
		medicalRecordId
	);

	return [medicalRecord];
}

/**
 * Retrieves all medical records for a specific animal.
 * @param {string} req.body.animalId - UUID of the animal
 * @returns {Promise<Array>} Array of medical record objects ordered by visit date (descending)
 * @throws {Error} If animalId is missing
 */
async function getNyByAnimal(req, _res) {
	const { animalId } = req.body;

	if (!animalId) throw new Error('Missing animalId');

	let medicalRecords = await getNByKeyQuery(
		'MedicalRecord',
		'animalId',
		animalId
	);

	medicalRecords = medicalRecords.sort(
		(a, b) => new Date(b.visitDate) - new Date(a.visitDate)
	);

	return [medicalRecords];
}

/**
 * Retrieves medical records within a specified date range, optionally filtered by animal.
 * @param {string} req.body.startDate - Start datetime for range
 * @param {string} req.body.endDate - End datetime for range
 * @param {string} [req.body.animalId] - UUID of the animal (optional filter)
 * @returns {Promise<Array>} Array of medical record objects ordered by visit date (descending)
 * @throws {Error} If startDate or endDate is missing
 */
async function getNByDateRange(req, _res) {
	const { startDate, endDate, animalId } = req.body;

	if (!startDate || !endDate) throw new Error('Missing startDate or endDate');

	let q = `
		SELECT *
		FROM MedicalRecord
		WHERE visitDate >= ? AND visitDate <= ? AND deletedAt IS NULL
	`;
	const params = [startDate, endDate];

	// Optional filter by animal
	if (animalId) {
		q += ` AND animalId = ?`;
		params.push(animalId);
	}

	q += ` ORDER BY visitDate DESC`;

	const medicalRecords = await query(q, params);

	if (!medicalRecords || medicalRecords.length === 0) {
		return [[]]; // return empty array if no records found
	}

	return [medicalRecords];
}

/**
 * Retrieves all active medical records (animals still in care with no checkout date).
 * @returns {Promise<Array>} Array of active medical record objects ordered by visit date (descending)
 */
async function getActiveRecords(_req, _res) {
	// Get records where checkoutDate is NULL (animal still in care)
	// using db.query for NULL check
	const medicalRecords = await query(
		`
		SELECT *
		FROM MedicalRecord
		WHERE checkoutDate IS NULL AND deletedAt IS NULL
		ORDER BY visitDate DESC
		`
	);

	if (!medicalRecords || medicalRecords.length === 0) {
		return [[]]; // return empty array if no records found
	}

	return [medicalRecords];
}

/**
 * Updates an existing medical record.
 * @param {string} req.body.medicalRecordId - UUID of the medical record to update
 * @param {string} [req.body.veterinarianNotes] - Updated notes
 * @param {string} [req.body.reasonForVisit] - Updated reason for visit
 * @param {string} [req.body.checkoutDate] - Updated checkout date
 * @returns {Promise<Array>} Array containing the updated medical record object
 * @throws {Error} If medical record data or medicalRecordId is missing
 */
async function updateOne(req, _res) {
	const updatedRecord = req.body;

	if (!updatedRecord || !updatedRecord.medicalRecordId) {
		throw new Error('Missing medical record data or medicalRecordId');
	}

	const newRecordData = { ...updatedRecord };

	await updateOneQuery('MedicalRecord', newRecordData, 'medicalRecordId');

	return [updatedRecord];
}

/**
 * Soft deletes a medical record by setting its deletedAt timestamp.
 * @param {string} req.body.medicalRecordId - UUID of the medical record to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If medicalRecordId is missing
 */
async function deleteOne(req, _res) {
	const { medicalRecordId } = req.body;

	if (!medicalRecordId) throw new Error('Missing medicalRecordId');

	const result = await query(
		`
		UPDATE MedicalRecord
		SET deletedAt = CURRENT_TIMESTAMP()
		WHERE medicalRecordId = ? AND deletedAt IS NULL
		`,
		[medicalRecordId]
	);

	if (result.affectedRows === 0) {
		throw new Error(
			'No medical record found to delete or it is already deleted'
		);
	}

	return [{ message: `Medical record deleted with ID ${medicalRecordId}` }];
}

/**
 * Adds a prescribed medication to a medical record.
 * @param {string} req.body.medicalRecordId - UUID of the medical record
 * @param {string} req.body.medication - Name/description of the medication
 * @returns {Promise<Array>} Array containing the created prescribed medication with generated prescribedMedicationId
 * @throws {Error} If medicalRecordId or medication is missing
 */
async function addPrescribedMedication(req, _res) {
	const { medicalRecordId, medication } = req.body;

	if (!medicalRecordId || !medication) {
		throw new Error('Missing medicalRecordId or medication');
	}

	const prescribedMedicationId = crypto.randomUUID();

	await createOneQuery('PrescribedMedication', {
		prescribedMedicationId,
		medicalRecordId,
		medication,
	});

	return [{ prescribedMedicationId, medicalRecordId, medication }];
}

/**
 * Retrieves all prescribed medications for a specific medical record.
 * @param {string} req.body.medicalRecordId - UUID of the medical record
 * @returns {Promise<Array>} Array of prescribed medication objects
 * @throws {Error} If medicalRecordId is missing or no medications are found
 */
async function getMedicationsByRecord(req, _res) {
	const { medicalRecordId } = req.body;

	if (!medicalRecordId) throw new Error('Missing medicalRecordId');

	const prescribedMedications = await getNByKeyQuery(
		'PrescribedMedication',
		'medicalRecordId',
		medicalRecordId,
		false
	);

	return [prescribedMedications];
}

/**
 * Removes a prescribed medication (hard delete).
 * @param {string} req.body.prescribedMedicationId - UUID of the prescribed medication to remove
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If prescribedMedicationId is missing
 */
async function removePrescribedMedication(req, _res) {
	const { prescribedMedicationId } = req.body;

	if (!prescribedMedicationId)
		throw new Error('Missing prescribedMedicationId');

	// using query for hard delete
	await query(
		`
		DELETE FROM PrescribedMedication
		WHERE prescribedMedicationId = ?
		`,
		[prescribedMedicationId]
	);

	return [
		{
			message: `Prescribed medication removed with ID ${prescribedMedicationId}`,
		},
	];
}

/**
 * Assigns a veterinarian to a medical record.
 * @param {string} req.body.medicalRecordId - UUID of the medical record
 * @param {string} req.body.vetName - Name of the veterinarian
 * @param {string} req.body.vetEmail - Email of the veterinarian
 * @param {string} req.body.vetOffice - Office location of the veterinarian
 * @returns {Promise<Array>} Array containing the created veterinarian assignment with generated veterinarianId
 * @throws {Error} If any required veterinarian data is missing
 */
async function assignVeterinarian(req, _res) {
	const { medicalRecordId, vetName, vetEmail, vetOffice } = req.body;

	if (!medicalRecordId || !vetName || !vetEmail || !vetOffice) {
		throw new Error('Missing required veterinarian data');
	}

	const veterinarianId = crypto.randomUUID();

	const assignedVet = {
		veterinarianId,
		medicalRecordId,
		vetName,
		vetEmail,
		vetOffice,
	};

	await createOneQuery('AssignedVeterinarian', assignedVet);

	return [assignedVet];
}

/**
 * Retrieves the assigned veterinarian for a specific medical record.
 * @param {string} req.body.medicalRecordId - UUID of the medical record
 * @returns {Promise<Array>} Array containing the assigned veterinarian object
 * @throws {Error} If medicalRecordId is missing or no veterinarian is found
 */
async function getVeterinarianByRecord(req, _res) {
	const { medicalRecordId } = req.body;

	if (!medicalRecordId) throw new Error('Missing medicalRecordId');

	const [assignedVet] = await getNByKeyQuery(
		'AssignedVeterinarian',
		'medicalRecordId',
		medicalRecordId,
		false
	);

	return [assignedVet];
}


// 💡 NEW FUNCTION: Get all non-deleted records for one animal
async function getForAnimal(req, _res) {
    const { animalId } = req.body;
    if (!animalId) throw new Error('Missing animalId');

    const records = await query(
        `SELECT * FROM MedicalRecord 
         WHERE animalId = ? AND deletedAt IS NULL 
         ORDER BY visitDate DESC`, // Order by most recent
        [animalId]
    );
    // Return records, even if it's an empty array
    return [records];
}

// 💡 NEW FUNCTION: Get all DELETED records for one animal
async function getAllDeletedForAnimal(req, _res) {
    const { animalId } = req.body;
    if (!animalId) throw new Error('Missing animalId');

    const records = await query(
        `SELECT * FROM MedicalRecord 
         WHERE animalId = ? AND deletedAt IS NOT NULL 
         ORDER BY visitDate DESC`,
        [animalId]
    );
    // Return records, even if it's an empty array
    return [records];
}


export default {
	createOne,
	getOneById,
	getNyByAnimal,
	getNByDateRange,
	getActiveRecords,
	updateOne,
	deleteOne,
	addPrescribedMedication,
	getMedicationsByRecord,
	removePrescribedMedication,
	assignVeterinarian,
	getVeterinarianByRecord,
	getForAnimal,
    getAllDeletedForAnimal,
};
