import { withAccessLevel } from '../utils/auth-utils.js';
import dietController from '../controllers/dietController.js';

export function registerDietRoutes(app) {
	app.post(
		'/api/diet/create',
		withAccessLevel('zookeeper', dietController.createOne)
	);
	app.put(
		'/api/diet/update',
		withAccessLevel('zookeeper', dietController.updateOne)
	);
	app.post('/api/diet/get-by-id', dietController.getOneById);
	app.post('/api/diet/get-with-schedule', dietController.getOneWithSchedule);
	app.post('/api/diet/get-schedule-days', dietController.getScheduleDaysByDiet);
	app.post(
		'/api/diet/add-schedule-day',
		withAccessLevel('zookeeper', dietController.addScheduleDay)
	);
	app.put(
		'/api/diet/update-schedule-day',
		withAccessLevel('zookeeper', dietController.updateScheduleDay)
	);
	app.post(
		'/api/diet/delete-schedule-day',
		withAccessLevel('zookeeper', dietController.deleteScheduleDay)
	);
}

