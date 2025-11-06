import employeeController from '../controllers/employeeController.js';
import { withAccessLevel } from '../utils/auth-utils.js';

export function registerEmployeeRoutes(app) {
	app.post(
		'/api/employee/create',
		withAccessLevel('manager', employeeController.createOne)
	);
	app.post(
		'/api/employee/get-one-by-id',
		withAccessLevel('manager', employeeController.getOneById)
	);
	app.post(
		'/api/employee/get-n-by-business',
		withAccessLevel('manager', employeeController.getNByBusiness)
	);
	app.put(
		'/api/employee/update-one',
		withAccessLevel('zookeeper', employeeController.updateOne)
	);
	app.post(
		'/api/employee/get-n-by-animal',
		withAccessLevel('zookeeper', employeeController.getNByAnimal)
	);
	app.post(
		'/api/employee/get-n-by-business-and-access-level',
		withAccessLevel(
			'manager',
			employeeController.getNByBusinessAndAccessLevel
		)
	);
	app.post(
		'/api/employee/get-all',
		withAccessLevel('manager', employeeController.getAll)
	);
	app.post(
		'/api/employee/get-all-handlers',
		employeeController.getAllHandlers
	);
	app.post(
        '/api/employee/assign-animals',
        withAccessLevel('manager', employeeController.assignAnimals)
    );
}
