import { withAccessLevel } from "../utils/auth-utils"
import animalController from "../controllers/animalController.js"
import animalReportController from "../controllers/animalReportController.js";

export function registerAnimalRoutes(app) {
    app.post('/api/animal/create', withAccessLevel('zookeeper', animalController.createOne));
    app.put('/api/animal/update', withAccessLevel('zookeeper', animalController.updateOne));
    app.post('/api/animal/get-one-by-id', animalController.getOneById);
    app.post('/api/animal/get-n-by-habitat', animalController.getNByHabitat);
    app.post('/api/animal/get-n-by-handler', animalController.getNByHandler);
    app.post('/api/animal/report', withAccessLevel('zookeeper', animalReportController.getAnimalReport));
}   
