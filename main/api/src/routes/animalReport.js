import { withAccessLevel } from '../utils/auth-utils.js';
import animalReportController from '../controllers/animalReportController.js';

export function registerAnimalReportRoutes(app) {
	// Get animal report - zookeeper+ can access
	app.post(
		'/api/animal-report/get',
		withAccessLevel('zookeeper', animalReportController.getAnimalReport)
	);
}

