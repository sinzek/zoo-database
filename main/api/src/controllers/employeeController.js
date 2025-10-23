import crypto from 'crypto';
import { createUser } from '../utils/auth-utils.js';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';
import { ACCESS_LEVELS } from '../constants/accessLevels.js';
import { query } from '../db/mysql.js';

async function createOne(req, _res) {
	//careful of creating employees. <<--// wym? -chase <<--// I think this was a comment from a lot earlier, -joseph
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

async function getOneById(req, _res) {
	const { employeeId } = req.body;

	if (!employeeId) throw new Error('Missing employeeId');

	const [employee] = await getNByKeyQuery('Employee', 'employeeId', employeeId);

	return [employee];
}

async function getNByBusiness(req, _res) {
	const { businessId } = req.body;

	if (!businessId) throw new Error('Missing businessId');

	const employees = await getNByKeyQuery('Employee', 'businessId', businessId);

	return employees; // array of employees with given businessId
}

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

async function getNByAnimal(req, _res) {
	const { animalId } = req.body;

	if (!animalId) throw new Error('Missing animalId');

	const takesCareOfRecords = await getNByKeyQuery('TakesCareOf', 'animalId', animalId);

	const employeeIds = takesCareOfRecords.map(record => record.employeeId);

	const employees = [];

	for (const empId of employeeIds) {
		const employees = await getNByKeyQuery('Employee', 'employeeId', empId);
		if(employees.length > 1) {
			employees = employees.concat(employees);
		} else if(employees.length === 1) {
			employees.push(employees[0]);
		}
		// otherwise skip, no employee found
	}

	return [employees]; // array of employees who take care of the given animal
}

async function getNByBusinessAndAccessLevel(req, _res) {
	const { businessId, accessLevel } = req.body;

	if (!businessId) throw new Error('Missing businessId');
	if(!accessLevel) throw new Error('Missing accessLevel');

	if(!ACCESS_LEVELS[accessLevel]) {
		throw new Error('Invalid access level');
	}

	const employees = await query(
		`SELECT * FROM Employee WHERE businessId = ? AND accessLevel = ?`,
		[businessId, accessLevel]
	);

	return [employees];
}

//Create Employee
//Get Employee by ID
//Get Employees by Business
//Get Access Level
//Update Employee

export default { createOne, getOneById, getNByBusiness, updateOne, getNByAnimal, getNByBusinessAndAccessLevel };
