import itemController from '../controllers/itemController.js';

export function registerItemRoutes(app) {
	app.post('/api/item/create', itemController.createOne);
	app.post('/api/item/update', itemController.updateOne);
	app.post('/api/item/delete', itemController.deleteOne);
	app.post('/api/item/get-by-id', itemController.getOneById);
	app.post('/api/item/get-n-by-business', itemController.getNByBusiness);
	app.post(
		'/api/item/get-n-and-businesses',
		itemController.getNAndBusinesses
	);
}
