import membershipController from '../controllers/membershipController.js';
import { withAuth } from '../utils/auth-utils.js';

export function registerMembershipRoutes(app) {
	app.post(
		'/api/membership/cancel',
		withAuth(membershipController.cancelMembership)
	);
}
