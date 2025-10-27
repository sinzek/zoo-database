import { withAccessLevel } from "../utils/auth-utils";
import customerController from "../controllers/customerController.js";

export function registerCustomerRoutes(app) {
		app.put('/api/customer/update', withAccessLevel(['admin', 'manager'], customerController.updateOne));
		app.post('/api/customer/get-one-by-id', customerController.getOne);
		app.delete('/api/customer/delete');
		app.put('api/customer/getAll')
}	