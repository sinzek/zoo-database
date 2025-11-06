import { withAccessLevel } from '../utils/auth-utils.js';
import medicalRecordController from '../controllers/medicalRecordController.js';

export function registerMedicalRecordRoutes(app) {
	app.post(
		'/api/medical-record/create',
		withAccessLevel('zookeeper', medicalRecordController.createOne)
	);
	app.put(
		'/api/medical-record/update',
		withAccessLevel('zookeeper', medicalRecordController.updateOne)
	);
	app.post(
		'/api/medical-record/delete',
		withAccessLevel('zookeeper', medicalRecordController.deleteOne)
	);
	app.post('/api/medical-record/get-by-id', medicalRecordController.getOneById);
	app.post('/api/medical-record/get-by-animal', medicalRecordController.getNyByAnimal);
	app.post('/api/medical-record/get-active', medicalRecordController.getActiveRecords);
}

