import shiftReportController from "../controllers/shiftReport.js";
import { withAccessLevel } from "../utils/auth-utils.js";

/**
 * Register shift report routes.
 * All routes require manager level or higher access.
 */
export function registerShiftReportRoutes(app) {
  // Get full detailed shift report with all shifts and employee information
  app.post(
    "/api/shift-report/full", 
    withAccessLevel('manager', shiftReportController.getShiftReport)
  );

  // Get summary shift report (totals only, no detailed shift arrays)
  app.post(
    "/api/shift-report/summary", 
    withAccessLevel('manager', shiftReportController.getShiftReportSummary)
  );

  // Get aggregated shift report (grand totals across all selected businesses)
  app.post(
    "/api/shift-report/aggregated", 
    withAccessLevel('manager', shiftReportController.getAllBusinessesShiftReport)
  );
}

