import employeeController from "../controllers/employeeController.js";
import { withAccessLevel } from "../utils/auth-utils.js";

export function registerEmployeeRoutes(app) {
  app.post("/api/employee/create", withAccessLevel('executive', employeeController.createOne));
  app.post("/api/employee/get-one-by-id", withAccessLevel('manager', employeeController.getOneById));
  app.post(
    "/api/employee/get-n-by-business",
   withAccessLevel('manager', employeeController.getNByBusiness)
  );
  app.put("/api/employee/update", withAccessLevel('executive', employeeController.updateOne));
  app.post("/api/employee/get-n-by-animal", withAccessLevel('zookeeper', employeeController.getNByAnimal));
  app.post("/api/employee/get-n-by-business-and-access-level", withAccessLevel('manager', employeeController.getNByBusinessAndAccessLevel));
}
