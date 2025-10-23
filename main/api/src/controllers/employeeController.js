import crypto from 'crypto';
import { createUser } from '../utils/auth-utils.js';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

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

	const rows = await getNByKeyQuery('Employee', 'employeeId', employeeId);

	return [rows[0]]; // array with single employee object
}

async function getNByBusinessId(req, _res) {
	const { businessId } = req.body;

	if (!businessId) throw new Error('Missing businessId');

	const rows = await getNByKeyQuery('Employee', 'businessId', businessId);

	return rows; // array of employees with given businessId
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

//Create Employee
//Get Employee by ID
//Get Employees by Business
//Get Access Level
//Update Employee

export default { createOne, getOneById, getNByBusinessId, updateOne };
