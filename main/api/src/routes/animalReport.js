import { withAccessLevel } from '../utils/auth-utils.js';
import animalReportController from '../controllers/animalReportController.js';
import dietReportController from '../controllers/dietReportController.js';

export function registerAnimalReportRoutes(app) {
	// Get animal report - zookeeper+ can access
	app.post(
		'/api/animal-report/get',
		withAccessLevel('zookeeper', animalReportController.getAnimalReport)
	);
	// Get diet report - zookeeper+ can access
	app.post(
		'/api/diet-report/get',
		withAccessLevel('zookeeper', dietReportController.getDietReport)
	);
}

