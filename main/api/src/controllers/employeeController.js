import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import crypto from 'crypto';

async function createOne(req, res){ //careful of creating employees.
	const createdEmployee = req.body;
	const {accessLevel, jobTitle, fName, lName, MI, sex, ssn, hourlyWage, jobDesc, addPostalCode, addSt, addCity, addState, payInfoAccNum, payInfoRouteNum, paymentMethod, businessId, hireDate, birthDate, phone, email} = createdEmployee;

	const employeeID = crypto.randomUUID();
	await db.query(`
		INSERT INTO Employee (employeeId, accessLevel, jobTitle, firstName, lastName, middleInitial, sex, ssn, hourlywage, jobDescription, addressPostalCode, addressStreet, addressCity, addressState, payInfoAccountNum, payInfoRoutingNum, payInfoPaymentMethod, businessId, hireDate, phone, email)
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
	[
		employeeID, jobTitle, accessLevel, fName, lName, MI, sex, ssn, hourlyWage, jobDesc, addPostalCode, addSt, addCity, addState, payInfoAccNum, payInfoRouteNum, paymentMethod, businessId, hireDate, birthDate, phone, email
	]);
	return sendJSON(res,
		201,
		{message: 'Employee successfully created'}
	);
}

async function getOneByID(req, res){
	const findEmployee = req.body; //findAnimal only has the animalID

	const findEmployeeID = findEmployee.animalID;
	const [result] = await db.query(`
		SELECT *
		FROM Employee
		WHERE employeeId = ?
		`,
	[
		findEmployeeID
	]);

	if(result.length === 0){
		throw new Error('Employee is not found');
	}
	
	const findEmployees = result[0];
	return sendJSON(res,
		201,
		{findEmployees}
	);
}

async function GetManyByBusiness(req, res){
	const findEmployees = req.body; //findAnimal only has the animalID

	const findEmployeeBusiness = findEmployees.businessId;
		const [result] = await db.query(`
			SELECT *
			FROM Employee
			WHERE businessId = ? AND deletedAt IS NULL
			`,
		[
			findEmployeeBusiness
		]);

		if(result.length === 0){
			throw new Error('Employees not found');
		}
		
		return sendJSON(res,
			201,
			{result}
		);
}

async function updateOne(req, res){
	const findEmployee = req.body;
	const {accessLevel, jobTitle, firstName, lastName, middleInitial, sex, ssn, hourlyWage, jobDescription, addressPostalCode, addressCity, addressState, payInfoAccountNum, payInfoPaymentMethod, businessId, terminationDate, birthDate, phone, email, supervisorId} = findEmployee;
	await db.query(
		`
			UPDATE Employee
			SET accessLevel = ?, jobTitle = ?, firstName = ?, lastName = ?, middleInitial = ?, sex = ?, ssn = ?, hourlyWage = ?, jobDescription = ?, addressPostalCode = ?, addressCity = ?, addressState = ?, payInfoAccountNum = ?, payInfoPaymentMethod = ?, businessId = ?, terminationDate = ?, birthDate = ?, phone = ?, email = ?, supervisorId = ?
			WHERE employeeId = ? AND deletedAt IS NULL;

		`,
		[
			accessLevel, jobTitle, firstName, lastName, middleInitial, sex, ssn, hourlyWage, jobDescription, addressPostalCode, addressCity, addressState, payInfoAccountNum, payInfoPaymentMethod, businessId, terminationDate, birthDate, phone, email, supervisorId
		]
	);
}


//Create Employee
//Get Employee by ID
//Get Employees by Business
//Get Access Level
//Update Employee



export default {createOne, getOneByID, GetManyByBusiness, updateOne};