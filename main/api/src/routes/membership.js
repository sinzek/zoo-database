import membershipController from '../controllers/membershipController.js';

export function registerMembershipRoutes(app) {
	app.post('/api/membership/cancel', membershipController.cancelMembership);
}
