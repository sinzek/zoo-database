import businessController from '../controllers/businessController.js';

export function registerBusinessRoutes(app) {
	app.post('/api/business/get-one-by-id', businessController.getOneById);
	app.post(
		'/api/business/get-all-with-hours',
		businessController.getAllWithHours
	);
	app.post('/api/business/get-all', businessController.getAll);
	app.post('/api/business/create', businessController.createOne);
	app.post('/api/business/update-info', businessController.updateOneInfo);
	app.post('/api/business/update-hours', businessController.updateOneHours);
	app.post('/api/business/delete', businessController.deleteOne);
	app.put('/api/business/update-one', businessController.updateOne);
}
