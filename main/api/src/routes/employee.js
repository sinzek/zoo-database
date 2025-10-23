import employeeController from "../controllers/employeeController.js";

export function registerEmployeeRoutes(app) {
  app.post("/api/employee/create", employeeController.createOne);
  app.post("/api/employee/get-by-id", employeeController.getOneById);
  app.post(
    "/api/employee/get-by-business-id",
    employeeController.getNByBusinessId
  );
  app.put("/api/employee/update", employeeController.updateOne);
}
