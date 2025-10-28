import purchaseController from '../controllers/purchaseController.js';
import { withAuth } from '../utils/auth-utils.js';

export function registerPurchaseRoutes(app) {
	app.post(
		'/api/purchase/membership',
		withAuth(purchaseController.purchaseMembership)
	);
	app.post('/api/purchase/items', withAuth(purchaseController.purchaseItems));
}
