import shiftController from '../controllers/shiftController.js';
import { withAccessLevel } from '../utils/auth-utils.js';

export function registerShiftRoutes(app) {
	app.post('/api/shifts/create', shiftController.createOne);
	app.post('/api/shifts/update', shiftController.updateOne);
	app.post('/api/shifts/delete', shiftController.deleteOne);
	app.post('/api/shifts/get-by-id', shiftController.getOneById);
	app.post(
		'/api/shifts/get-n-by-attraction',
		shiftController.getNByAttraction
	);
	app.post(
		'/api/shifts/get-n-by-date-range',
		shiftController.getNByDateRange
	);
	app.post(
		'/api/shifts/assign-employee-to-shift',
		shiftController.assignOneEmployeeToShift
	);
	app.post('/api/shifts/get-n-by-employee', shiftController.getNByEmployee);
	app.post(
		'/api/shifts/get-employees-by-shift',
		shiftController.getNEmployeesByShift
	);
	app.post(
		'/api/shifts/remove-employee-from-shift',
		shiftController.removeOneEmployeeFromShift
	);
	app.post(
		'/api/shifts/clockOut',
		withAccessLevel('worker', shiftController.clockOutEmployee)
	);
}
