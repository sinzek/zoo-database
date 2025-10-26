import businessController from '../controllers/businessController.js';

export function registerBusinessRoutes(app) {
	app.post('/api/business/get-one-by-id', businessController.getOneById);
}
