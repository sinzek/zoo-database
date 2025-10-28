import { withAccessLevel } from '../utils/auth-utils.js';
import attractionController from '../controllers/attractionController.js';

export function registerAttractionRoutes(app) {
	// Get all attractions - viewable by zookeepers+
	app.post('/api/attractions/get-all', attractionController.getAll);
	
	// Get one attraction - viewable by zookeepers+
	app.post('/api/attractions/get-one', attractionController.getOne);
	
	// Create attraction - managers+
	app.post(
		'/api/attraction/create',
		withAccessLevel('manager', attractionController.createOne)
	);
	
	// Update attraction info - managers+
	app.put(
		'/api/attraction/update-info',
		withAccessLevel('manager', attractionController.updateOneInfo)
	);
	
	// Update attraction hours - managers+
	app.put(
		'/api/attraction/update-hours',
		withAccessLevel('manager', attractionController.updateOneHours)
	);
	
	// Soft delete attraction - managers+
	app.post(
		'/api/attraction/delete',
		withAccessLevel('manager', attractionController.deleteOne)
	);
}

