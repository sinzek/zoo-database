import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import { validateStrings, determineEmptyFields} from '../utils/auth-utils.js';
import crypto from 'crypto';

async function createEmployee(req, res){ //careful of creating employees.
	const createdEmployee = req.body;
	const {accessLevel, jobTitle, fName, lName, MI, sex, ssn, hourlyWage, jobDesc, addPostalCode, addSt, addCity, addState, payInfoAccNum, payInfoRouteNum, paymentMethod, businessId, hireDate, birthDate, phone, email} = createdEmployee;
	if(!createdEmployee || typeof createdEmployee !== 'object'){
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}

	if (
		!validateStrings(jobTitle, fName, lName, jobDesc, addSt, addCity, addState, payInfoRouteNum, payInfoRouteNum)
	) {
		return sendJSON(res, 400, {
			error: 'Missing required fields',
			affectedFields: determineEmptyFields(createdEmployee),
		});
	}

	try{
		const employeeID = crypto.randomUUID();
		await db.query(`
			INSERT INTO Employee (employeeId, accessLevel, jobTitle, firstName, lastName, middleInitial, sex, ssn, hourlywage, jobDescription, addressPostalCode, addressStreet, addressCity, addressState, payInfoAccountNum, payInfoRoutingNum, payInfoPaymentMethod, businessId, hireDate, phone, email)
			VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`,
		[
			employeeID, jobTitle, accessLevel, fName, lName, MI, sex, ssn, hourlyWage, jobDesc, addPostalCode, addSt, addCity, addState, payInfoAccNum, payInfoRouteNum, paymentMethod, businessId, hireDate, birthDate, phone, email
		]);

	}
	catch(err){
		if (err.code === 'ER_DUP_ENTRY') {
			return sendJSON(res, 409, {
				error: 'Employee with provided SSN already exists',
			});
		}
		return sendJSON(res,
			404,
			{
				error: "Could not create Employee"
			}
		);	
	}
}

async function getEmployeeByID(req, res){
	const findEmployee = req.body; //findAnimal only has the animalID

	if (!findEmployee || typeof findEmployee !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}
	const findEmployeeID = findEmployee.animalID;
	try{
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
		
		const findEmployee = result[0];
		return sendJSON(res,
			201,
			{findEmployee}
		);

	}catch(err){
		return sendJSON(res,
			404,
			{
				error: "Could not find Employee"
			}
		);
	}
}

async function getEmployeeByBusiness(req, res){
	const findEmployees = req.body; //findAnimal only has the animalID

	if (!findEmployees || typeof findEmployees !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}
	const findEmployeeBusiness = findEmployees.businessId;
	try{
		const [result] = await db.query(`
			SELECT *
			FROM Employee
			WHERE businessId = ?
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

	}catch(err){
		return sendJSON(res,
			404,
			{
				error: "Could not find Employee"
			}
		);
	}
}

async function updateEmployee(req, res){
	const findEmployee = req.body;
	const {accessLevel, jobTitle, firstName, lastName, middleInitial, sex, ssn, hourlyWage, jobDescription, addressPostalCode, addressCity, addressState, payInfoAccountNum, payInfoPaymentMethod, businessId, terminationDate, birthDate, phone, email, supervisorId} = findEmployee;
	if(findEmployee || typeof findEmployee !== 'object'){
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}
  try{
		const [result] = await db.query(
			`
				UPDATE Employee
				SET accessLevel = ?, jobTitle = ?, firstName = ?, lastName = ?, middleInitial = ?, sex = ?, ssn = ?, hourlyWage = ?, jobDescription = ?, addressPostalCode = ?, addressCity = ?, addressState = ?, payInfoAccountNum = ?, payInfoPaymentMethod = ?, businessId = ?, terminationDate = ?, birthDate = ?, phone = ?, email = ?, supervisorId = ?

			`,
			[
				accessLevel, jobTitle, firstName, lastName, middleInitial, sex, ssn, hourlyWage, jobDescription, addressPostalCode, addressCity, addressState, payInfoAccountNum, payInfoPaymentMethod, businessId, terminationDate, birthDate, phone, email, supervisorId
			]
		);
	}
	catch(err){
		return sendJSON(res,
			404,
			{
				error: "Could not update Employee"
			}
		);
	}
}


//Create Employee
//Get Employee by ID
//Get Employees by Business
//Get Access Level
//Update Employee



export default {createEmployee, getEmployeeByID, getEmployeeByBusiness, updateEmployee};