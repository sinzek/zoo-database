import { withAccessLevel } from '../utils/auth-utils.js';
import habitatController from '../controllers/habitatController.js';

export function registerHabitatRoutes(app) {
	app.post(
		'/api/habitat/create',
		withAccessLevel('manager', habitatController.createOne)
	);
	app.put(
		'/api/habitat/update',
		withAccessLevel('manager', habitatController.updateOne)
	);
	app.post('/api/habitats/get-one', habitatController.getOneById);
	app.post('/api/habitats/get-all', habitatController.getAll);
	app.post('/api/habitat/get-all-including-deleted', habitatController.getAllIncludingDeleted);
	app.post('/api/habitat/get-animal-count', habitatController.getAnimalCount);
	app.post(
		'/api/habitat/delete',
		withAccessLevel('manager', habitatController.deleteOne)
	);
}
