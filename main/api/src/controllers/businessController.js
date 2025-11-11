import { query } from '../db/mysql.js';
import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new business with operating hours for each day of the week.
 * @param {string} req.body.name - Business name
 * @param {string} req.body.address - Business address
 * @param {string} req.body.phone - Phone number (10 digits)
 * @param {string} req.body.email - Email address
 * @param {string} [req.body.uiDesc] - Description for UI purposes
 * @param {string} req.body.businessType - Type ('zoo', 'retail', 'food', 'vet_clinic')
 * @param {string} req.body.createdAt - Creation date
 * @param {string} [req.body.ownerID] - UUID of owner employee
 * @param {string} req.body.mondayOpen - Monday opening time
 * @param {string} req.body.mondayClose - Monday closing time
 * @param {string} req.body.tuesdayOpen - Tuesday opening time
 * @param {string} req.body.tuesdayClose - Tuesday closing time
 * @param {string} req.body.wednesdayOpen - Wednesday opening time
 * @param {string} req.body.wednesdayClose - Wednesday closing time
 * @param {string} req.body.thursdayOpen - Thursday opening time
 * @param {string} req.body.thursdayClose - Thursday closing time
 * @param {string} req.body.fridayOpen - Friday opening time
 * @param {string} req.body.fridayClose - Friday closing time
 * @param {string} req.body.saturdayOpen - Saturday opening time
 * @param {string} req.body.saturdayClose - Saturday closing time
 * @param {string} req.body.sundayOpen - Sunday opening time
 * @param {string} req.body.sundayClose - Sunday closing time
 * @returns {Promise<Array>} Array containing the created business object with generated businessId
 * @throws {Error} If business data is missing
 */
async function createOne(req, _res) {
	const newBusiness = req.body;

	if (!newBusiness) throw new Error('Missing business data');

	const newBusinessID = crypto.randomUUID();

	const {
		name,
		address,
		phone,
		email,
		uiDesc,
		businessType,
		createdAt,
		ownerID,
	} = newBusiness;

	await createOneQuery('Business', {
		businessId: newBusinessID,
		name,
		address,
		phone,
		email,
		uiDescription: uiDesc,
		type: businessType,
		createdAt,
		ownerId: ownerID,
		numEmployees: 0,
	});

	const {
		mondayOpen,
		mondayClose,
		tuesdayOpen,
		tuesdayClose,
		wednesdayOpen,
		wednesdayClose,
		thursdayOpen,
		thursdayClose,
		fridayOpen,
		fridayClose,
		saturdayOpen,
		saturdayClose,
		sundayOpen,
		sundayClose,
	} = newBusiness;

	//create business hours
	const hours = [
		['Sunday', sundayOpen, sundayClose],
		['Monday', mondayOpen, mondayClose],
		['Tuesday', tuesdayOpen, tuesdayClose],
		['Wednesday', wednesdayOpen, wednesdayClose],
		['Thursday', thursdayOpen, thursdayClose],
		['Friday', fridayOpen, fridayClose],
		['Saturday', saturdayOpen, saturdayClose],
	];

	for (const [dayOfWeek, openTime, closeTime] of hours) {
		// Only create hours record if both openTime and closeTime are provided
		if (openTime && closeTime) {
			await createOneQuery('BusinessHoursDay', {
				businessHoursDayId: crypto.randomUUID(),
				businessId: newBusinessID,
				dayOfWeek,
				openTime,
				closeTime,
			});
		}
	}

	return [{ businessId: newBusinessID, ...newBusiness }];
}

/**
 * Soft deletes a business by setting its deletedAt timestamp.
 * @param {string} req.body.businessId - UUID of the business to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If businessId is missing
 */
async function deleteOne(req, _res) {
	const deleteBusiness = req.body;
	const deleteBusinessID = deleteBusiness.businessId || deleteBusiness.businessID;

	if (!deleteBusinessID) throw new Error('Missing businessId');

	// using query for soft delete
	await query(
		`
		UPDATE Business
		SET deletedAt = CURRENT_DATE()
		WHERE businessId = ? AND deletedAt IS NULL
		`,
		[deleteBusinessID]
	);

	//need to update ALL employees under business. Maybe allow null for employee's businessid for when business is deleted?

	return [{ message: 'Business successfully deleted' }];
}

/**
 * Updates a business's basic information (not hours).
 * Note: businessId and type cannot be updated.
 * @param {string} req.body.businessId - UUID of the business to update
 * @param {string} [req.body.name] - Updated name
 * @param {string} [req.body.address] - Updated address
 * @param {string} [req.body.phone] - Updated phone
 * @param {string} [req.body.email] - Updated email
 * @param {string} [req.body.uiDesc] - Updated description
 * @returns {Promise<Array>} Array containing the updated business object
 * @throws {Error} If business data or businessId is missing
 */
async function updateOneInfo(req, _res) {
	const updatedBusiness = req.body;

	if (!updatedBusiness || !updatedBusiness.businessId) {
		throw new Error('Missing business data or businessId');
	}

	const { businessId, name, address, phone, email, uiDesc } = updatedBusiness; //if updating a business, only these fields can be updated. If you try to update the ID it could break things, and a business type shouldnt be changed, just create another and delete the old one.

	await updateOneQuery(
		'Business',
		{
			businessId,
			name,
			address,
			phone,
			email,
			uiDescription: uiDesc,
		},
		'businessId'
	);

	return [updatedBusiness];
}

/**
 * Updates a business's operating hours for all days of the week.
 * @param {string} req.body.businessId - UUID of the business
 * @param {string} req.body.mondayOpen - Monday opening time
 * @param {string} req.body.mondayClose - Monday closing time
 * @param {string} req.body.tuesdayOpen - Tuesday opening time
 * @param {string} req.body.tuesdayClose - Tuesday closing time
 * @param {string} req.body.wednesdayOpen - Wednesday opening time
 * @param {string} req.body.wednesdayClose - Wednesday closing time
 * @param {string} req.body.thursdayOpen - Thursday opening time
 * @param {string} req.body.thursdayClose - Thursday closing time
 * @param {string} req.body.fridayOpen - Friday opening time
 * @param {string} req.body.fridayClose - Friday closing time
 * @param {string} req.body.saturdayOpen - Saturday opening time
 * @param {string} req.body.saturdayClose - Saturday closing time
 * @param {string} req.body.sundayOpen - Sunday opening time
 * @param {string} req.body.sundayClose - Sunday closing time
 * @returns {Promise<Array>} Array containing the updated hours object
 * @throws {Error} If business data or businessId is missing
 */
async function updateOneHours(req, _res) {
	const updatedBusinessHours = req.body;

	if (!updatedBusinessHours || !updatedBusinessHours.businessId) {
		throw new Error('Missing business data or businessId');
	}

	const {
		businessId,
		mondayOpen,
		mondayClose,
		tuesdayOpen,
		tuesdayClose,
		wednesdayOpen,
		wednesdayClose,
		thursdayOpen,
		thursdayClose,
		fridayOpen,
		fridayClose,
		saturdayOpen,
		saturdayClose,
		sundayOpen,
		sundayClose,
	} = updatedBusinessHours;

	//update business hours
	const hours = [
		['Sunday', sundayOpen, sundayClose],
		['Monday', mondayOpen, mondayClose],
		['Tuesday', tuesdayOpen, tuesdayClose],
		['Wednesday', wednesdayOpen, wednesdayClose],
		['Thursday', thursdayOpen, thursdayClose],
		['Friday', fridayOpen, fridayClose],
		['Saturday', saturdayOpen, saturdayClose],
	];

	// using query for composite key update
	for (const [dayOfWeek, openTime, closeTime] of hours) {
		await query(
			`
			UPDATE BusinessHoursDay
			SET openTime = ?, closeTime = ?
			WHERE businessId = ? AND dayOfWeek = ?;
			`,
			[openTime, closeTime, businessId, dayOfWeek]
		);
	}
	return [updatedBusinessHours];
}

async function getOneById(req, _res) {
	const { businessId } = req.body;

	if (!businessId) throw new Error('Missing businessId');

	const [business] = await getNByKeyQuery(
		'Business',
		'businessId',
		businessId
	);

	return [business];
}

/**
 * Retrieves all non-deleted businesses from the database.
 * @returns {Promise<Array>} Array of all business objects
 */
async function getAll(_req, _res) {
	const businesses = await query(
		'SELECT * FROM Business WHERE deletedAt IS NULL'
	);
	return [businesses];
}

/**
 * Retrieves all non-deleted businesses along with their operating hours.
 * @returns {Promise<Array>} Array of business objects, each with an 'hours' property.
 */
async function getAllWithHours(_req, _res) {
	const businesses = await query(
		'SELECT * FROM Business WHERE deletedAt IS NULL'
	);

	const businessIds = businesses.map((b) => b.businessId);

	if (businessIds.length === 0) {
		return [[]];
	}

	const hoursQuery = `
        SELECT * FROM BusinessHoursDay 
        WHERE businessId IN (?)
        ORDER BY FIELD(dayOfWeek, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
    `;
	const hours = await query(hoursQuery, [businessIds]);

	const businessesWithHours = businesses.map((business) => {
		const businessHours = hours.filter(
			(h) => h.businessId === business.businessId
		);
		return {
			...business,
			hours: businessHours,
		};
	});

	return [businessesWithHours];
}

async function updateOne(req, _res) {
	const businessData = req.body;

	if (!businessData || !businessData.businessId) {
		throw new Error('Missing business data or businessId');
	}

	const {
		businessId,
		name,
		address,
		phone,
		email,
		uiDescription,
		ownerId,
		hours,
	} = businessData;

	// 1. Update Business table information
	await updateOneQuery(
		'Business',
		{
			businessId,
			name,
			address,
			phone,
			email,
			uiDescription,
			ownerId,
		},
		'businessId'
	);

	// 2. Intelligently update, create, or delete BusinessHoursDay records
	if (hours) {
		for (const [dayOfWeek, time] of Object.entries(hours)) {
			const { openTime, closeTime } = time;

			// If openTime/closeTime are missing, it means the business is closed on this day.
			// Delete the record for this day if it exists.
			if (!openTime || !closeTime) {
				await query(
					'DELETE FROM BusinessHoursDay WHERE businessId = ? AND dayOfWeek = ?',
					[businessId, dayOfWeek]
				);
				continue;
			}

			// Try to update the record first.
			const updateResult = await query(
				`
                UPDATE BusinessHoursDay
                SET openTime = ?, closeTime = ?
                WHERE businessId = ? AND dayOfWeek = ?
                `,
				[openTime, closeTime, businessId, dayOfWeek]
			);

			// If no rows were affected by the update, it means the record doesn't exist.
			// Create a new one.
			if (updateResult.affectedRows === 0) {
				await createOneQuery('BusinessHoursDay', {
					businessHoursDayId: crypto.randomUUID(),
					businessId,
					dayOfWeek,
					openTime,
					closeTime,
				});
			}
		}
	}

	return [{ ...businessData }];
}


async function getAllDeleted(_req, _res) {
	const deletedBusinesses = await query(
		'SELECT * FROM Business WHERE deletedAt IS NOT NULL'
	);
	
	if (!deletedBusinesses || deletedBusinesses.length === 0) {
        throw new Error('No deleted businesses found');
    }

	return [deletedBusinesses];
}

export default {
	createOne,
	updateOneInfo,
	updateOneHours,
	deleteOne,
	getOneById,
	getAll,
	getAllWithHours,
	updateOne,
	getAllDeleted,
};
