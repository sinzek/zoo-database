import habitatController from '../controllers/habitatController.js';

export function registerHabitatRoutes(app) {
	app.post('/api/habitats/get-one', habitatController.getOneById);
	app.post('/api/habitats/get-all', habitatController.getAll);
}
