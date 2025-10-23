import crypto from 'crypto';
import { createUser } from '../utils/auth-utils.js';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new employee record with user account.
 * Creates both a User account and Employee record in a single operation.
 * @param {string} req.body.email - Employee email address
 * @param {string} req.body.password - Employee password
 * @param {string} req.body.accessLevel - Access level (worker, zookeeper, veterinarian, manager, executive, db_admin)
 * @param {string} req.body.jobTitle - Job title
 * @param {string} req.body.firstName - First name
 * @param {string} req.body.lastName - Last name
 * @param {string} [req.body.middleInitial] - Middle initial
 * @param {string} req.body.sex - Sex ('male' or 'female')
 * @param {string} req.body.ssn - Social security number
 * @param {number} req.body.hourlyWage - Hourly wage
 * @param {string} [req.body.jobDescription] - Job description
 * @param {string} req.body.addressPostalCode - Postal code
 * @param {string} req.body.addressStreet - Street address
 * @param {string} req.body.addressCity - City
 * @param {string} [req.body.addressState] - State
 * @param {string} [req.body.payInfoAccountNum] - Bank account number
 * @param {string} [req.body.payInfoRoutingNum] - Bank routing number
 * @param {string} req.body.payInfoPaymentMethod - Payment method ('check' or 'direct_deposit')
 * @param {string} req.body.businessId - UUID of the business
 * @param {string} [req.body.hireDate] - Hire date (defaults to current date)
 * @param {string} req.body.birthDate - Birth date
 * @param {string} req.body.phone - Phone number
 * @param {string} [req.body.supervisorId] - UUID of supervisor employee
 * @returns {Promise<Array>} Array containing the created employee object
 * @throws {Error} If employee data, email, or password is missing
 */
async function createOne(req, _res) {
	const newEmp = req.body;
	if (!newEmp) throw new Error('Missing employee data');

	if (!newEmp.email || !newEmp.password) {
		throw new Error('Missing employee account email or password');
	}

	// create user account first
	const { userId } = await createUser(newEmp.email, newEmp.password);

	const employeeId = crypto.randomUUID();

	const employeeData = {
		employeeId,
		accessLevel: newEmp.accessLevel,
		jobTitle: newEmp.jobTitle,
		firstName: newEmp.firstName,
		lastName: newEmp.lastName,
		middleInitial: newEmp.middleInitial,
		sex: newEmp.sex,
		ssn: newEmp.ssn,
		hourlyWage: newEmp.hourlyWage,
		jobDescription: newEmp.jobDescription,
		addressPostalCode: newEmp.addressPostalCode,
		addressStreet: newEmp.addressStreet,
		addressCity: newEmp.addressCity,
		addressState: newEmp.addressState,
		payInfoAccountNum: newEmp.payInfoAccountNum,
		payInfoRoutingNum: newEmp.payInfoRoutingNum,
		payInfoPaymentMethod: newEmp.payInfoPaymentMethod,
		businessId: newEmp.businessId,
		hireDate: newEmp.hireDate || new Date(),
		terminationDate: null,
		birthDate: newEmp.birthDate,
		phone: newEmp.phone,
		supervisorId: newEmp.supervisorId || null,
		userId: userId,
	};

	// now create employee record
	await createOneQuery('Employee', employeeData);

	// return created employee data
	return [employeeData];
}

/**
 * Retrieves a single employee by their ID.
 * @param {string} req.body.employeeId - UUID of the employee to retrieve
 * @returns {Promise<Array>} Array containing the employee object
 * @throws {Error} If employeeId is missing or no employee is found
 */
async function getOneById(req, _res) {
	const { employeeId } = req.body;

	if (!employeeId) throw new Error('Missing employeeId');

	const rows = await getNByKeyQuery('Employee', 'employeeId', employeeId);

	return [rows[0]]; // array with single employee object
}

/**
 * Retrieves all employees for a specific business.
 * @param {string} req.body.businessId - UUID of the business
 * @returns {Promise<Array>} Array of employee objects
 * @throws {Error} If businessId is missing or no employees are found
 */
async function getNByBusinessId(req, _res) {
	const { businessId } = req.body;

	if (!businessId) throw new Error('Missing businessId');

	const rows = await getNByKeyQuery('Employee', 'businessId', businessId);

	return rows; // array of employees with given businessId
}

/**
 * Updates an existing employee record.
 * Note: userId and ssn cannot be updated through this function.
 * @param {string} req.body.employeeId - UUID of the employee to update
 * @param {string} [req.body.accessLevel] - Updated access level
 * @param {string} [req.body.jobTitle] - Updated job title
 * @param {string} [req.body.firstName] - Updated first name
 * @param {string} [req.body.lastName] - Updated last name
 * @param {number} [req.body.hourlyWage] - Updated hourly wage
 * @param {string} [req.body.phone] - Updated phone number
 * @param {string} [req.body.addressStreet] - Updated street address
 * @param {string} [req.body.supervisorId] - Updated supervisor ID
 * @returns {Promise<Array>} Array containing the updated employee object
 * @throws {Error} If employee data or employeeId is missing
 */
async function updateOne(req, _res) {
	const updatedEmployee = req.body;

	if (!updatedEmployee || !updatedEmployee.employeeId) {
		throw new Error('Missing employee data or employeeId');
	}

	const newEmpData = { ...updatedEmployee };
	delete newEmpData.userId; // cannot update userId
	delete newEmpData.ssn; // cannot update ssn

	await updateOneQuery('Employee', newEmpData, 'employeeId');

	return [updatedEmployee]; // updated employee data
}

//Create Employee
//Get Employee by ID
//Get Employees by Business
//Get Access Level
//Update Employee

export default { createOne, getOneById, getNByBusinessId, updateOne };
