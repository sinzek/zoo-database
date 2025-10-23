import { App } from "./src/app.js";
import { registerDummyDataRoutes } from "./src/routes/dummyData.js";
import { registerEmployeeRoutes } from "./src/routes/employee.js";
import { registerAuthRoutes } from "./src/routes/auth.js";

/**
 * Main entry point for the API
 *
 *
 * This function creates a new App instance, registers all routes,
 * and delegates the request handling to the App instance
 */
export default async function handler(req, res) {
  const app = new App();

  // !--- start route registration ---!
  registerAuthRoutes(app);
  registerDummyDataRoutes(app);
  registerEmployeeRoutes(app);
  // !--- end route registration ---!

  return await app.handleVercel(req, res);
}
