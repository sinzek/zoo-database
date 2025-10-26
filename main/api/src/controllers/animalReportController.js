import { db } from '../db/mysql.js';

/**
 * Fetch animal report
 * Accepts optional filters:
 * - animalIds: array of animal UUIDs
 * - habitatId: string
 * - handlerId: string
 */
async function getAnimalReport(req, _res) {
    const { animalIds, habitatId, handlerId } = req.body;

    // Build WHERE clause dynamically
    let whereClause = 'WHERE a.deletedAt IS NULL';
    let params = [];

    if (animalIds && Array.isArray(animalIds) && animalIds.length > 0) {
        const placeholders = animalIds.map(() => '?').join(',');
        whereClause += ` AND a.animalId IN (${placeholders})`;
        params.push(...animalIds);
    }
    if (habitatId) {
        whereClause += ' AND a.habitatId = ?';
        params.push(habitatId);
    }
    if (handlerId) {
        whereClause += ' AND tco.employeeId = ?';
        params.push(handlerId);
    }

    // Main animal query with handler join
    const query = `
        SELECT a.*, h.name AS habitatName, d.dietId
        FROM Animal a
        LEFT JOIN Habitat h ON a.habitatId = h.habitatId
        LEFT JOIN Diet d ON a.dietId = d.dietId
        LEFT JOIN TakesCareOf tco ON a.animalId = tco.animalId
        ${whereClause}
        ORDER BY a.commonName
    `;

    const animals = await db.query(query, params);

    // Fetch medical records and diet schedule for each animal
    const reports = await Promise.all(animals.map(async animal => {
        // Medical records
        const medicalRecordsQuery = `
            SELECT mr.*, pm.medication, av.vetName, av.vetEmail, av.vetOffice
            FROM MedicalRecord mr
            LEFT JOIN PrescribedMedication pm ON mr.medicalRecordId = pm.medicalRecordId
            LEFT JOIN AssignedVeterinarian av ON mr.medicalRecordId = av.medicalRecordId
            WHERE mr.animalId = ? AND mr.deletedAt IS NULL
            ORDER BY mr.visitDate DESC
        `;
        const medicalRecords = await db.query(medicalRecordsQuery, [animal.animalId]);

        // Diet schedule
        const dietQuery = `
            SELECT dayOfWeek, feedTime, food
            FROM DietScheduleDay
            WHERE dietId = ? 
            ORDER BY FIELD(dayOfWeek, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), feedTime
        `;
        const dietSchedule = await db.query(dietQuery, [animal.dietId]);

        // Handlers
        const handlersQuery = `
            SELECT e.employeeId, e.firstName, e.lastName
            FROM Employee e
            JOIN TakesCareOf tco ON e.employeeId = tco.employeeId
            WHERE tco.animalId = ? AND e.deletedAt IS NULL
        `;
        const handlers = await db.query(handlersQuery, [animal.animalId]);

        return {
            ...animal,
            medicalRecords,
            dietSchedule,
            handlers
        };
    }));

    return reports;
}

export default {
    getAnimalReport
};
