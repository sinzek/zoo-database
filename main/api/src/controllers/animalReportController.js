import { db } from '../db/mysql.js';

/**
 * Animal report
 *
 * Accepts filters in req.body:
 *  - animalIds: optional array of animal UUIDs
 *  - handlerIds: optional array of employee UUIDs (handlers)
 *  - habitatIds: optional array of habitat UUIDs
 *  - includeDead: optional boolean - include animals with non-null deathDate (default false)
 *
 * Returns an array of animal reports. Each report includes:
 *  - animal attributes (from Animal)
 *  - habitat info
 *  - diet (specialNotes)
 *  - dietSchedule: array of day/feedTime/food records
 *  - handlers: array of employees caring for the animal
 *  - medicalRecords: array of records (each may include prescribed medications and assigned veterinarian)
 */
async function getAnimalReport(req, _res) {
  const { animalIds, handlerIds, habitatIds, includeDead = false } = req.body || {};

  // Build base WHERE clause for animals
  let where = ['a.deletedAt IS NULL'];
  const params = [];

  // animalIds filter (array expected)
  if (animalIds && Array.isArray(animalIds) && animalIds.length) {
    const placeholders = animalIds.map(() => '?').join(', ');
    where.push(`a.animalId IN (${placeholders})`);
    params.push(...animalIds);
  }

  // habitatIds filter
  if (habitatIds && Array.isArray(habitatIds) && habitatIds.length) {
    const placeholders = habitatIds.map(() => '?').join(', ');
    where.push(`a.habitatId IN (${placeholders})`);
    params.push(...habitatIds);
  }

  // handlerIds filter — require that the animal is taken care of by at least one of these handlers
  if (handlerIds && Array.isArray(handlerIds) && handlerIds.length) {
    const placeholders = handlerIds.map(() => '?').join(', ');
    // use EXISTS to ensure animals returned have a matching record in TakesCareOf
    where.push(`EXISTS (SELECT 1 FROM TakesCareOf t WHERE t.animalId = a.animalId AND t.employeeId IN (${placeholders}))`);
    params.push(...handlerIds);
  }

  // Exclude dead animals by default
  if (!includeDead) {
    where.push('a.deathDate IS NULL');
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Main animals query: fetch animal attributes + habitat name + dietId
  const animalsSql = `
    SELECT
      a.animalId,
      a.firstName,
      a.lastName,
      a.commonName,
      a.species,
      a.genus,
      a.birthDate,
      a.deathDate,
      a.importedFrom,
      a.importDate,
      a.sex,
      a.behavior,
      a.habitatId,
      h.name AS habitatName,
      h.description AS habitatDescription,
      a.dietId,
      d.specialNotes AS dietNotes
    FROM Animal a
    LEFT JOIN Habitat h ON a.habitatId = h.habitatId
    LEFT JOIN Diet d ON a.dietId = d.dietId
    ${whereClause}
    ORDER BY a.commonName, a.firstName
  `;

  const animals = await db.query(animalsSql, params);

  // If no animals found, return empty array (match friend style)
  if (!animals || animals.length === 0) return [];

  // For each animal fetch diet schedule, handlers, and medical records (with meds & vets)
  const reports = await Promise.all(
    animals.map(async (animal) => {
      // 1) Diet schedule
      const dietScheduleSql = `
        SELECT dietScheduleDayId, dayOfWeek, feedTime, food
        FROM DietScheduleDay
        WHERE dietId = ?
        ORDER BY FIELD(dayOfWeek, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), feedTime
      `;
      const dietSchedule = animal.dietId ? await db.query(dietScheduleSql, [animal.dietId]) : [];

      // 2) Handlers (employees that take care of the animal)
      const handlersSql = `
        SELECT e.employeeId, e.firstName, e.lastName, e.jobTitle, e.accessLevel
        FROM TakesCareOf t
        JOIN Employee e ON e.employeeId = t.employeeId
        WHERE t.animalId = ? AND e.deletedAt IS NULL
      `;
      const handlers = await db.query(handlersSql, [animal.animalId]);

      // 3) Medical records for animal (with prescribed medications and assigned veterinarian)
      // We'll first get medical records, then attachments
      const medicalRecordsSql = `
        SELECT 
          mr.medicalRecordId,
          mr.reasonForVisit,
          mr.veterinarianNotes,
          mr.visitDate,
          mr.checkoutDate
        FROM MedicalRecord mr
        WHERE mr.animalId = ? AND mr.deletedAt IS NULL
        ORDER BY mr.visitDate DESC
      `;
      const medicalRecords = await db.query(medicalRecordsSql, [animal.animalId]);

      // For each medical record, fetch medications and assigned vet
      const enrichedMedicalRecords = await Promise.all(
        medicalRecords.map(async (mr) => {
          const medsSql = `
            SELECT prescribedMedicationId, medication
            FROM PrescribedMedication
            WHERE medicalRecordId = ?
          `;
          const meds = await db.query(medsSql, [mr.medicalRecordId]);

          const vetSql = `
            SELECT veterinarianId, vetName, vetEmail, vetOffice
            FROM AssignedVeterinarian
            WHERE medicalRecordId = ?
            LIMIT 1
          `;
          const assignedVetRows = await db.query(vetSql, [mr.medicalRecordId]);
          const assignedVet = assignedVetRows && assignedVetRows.length ? assignedVetRows[0] : null;

          return {
            ...mr,
            prescribedMedications: meds,
            assignedVeterinarian: assignedVet,
          };
        })
      );

      return {
        // basic animal attributes
        animalId: animal.animalId,
        firstName: animal.firstName,
        lastName: animal.lastName,
        commonName: animal.commonName,
        species: animal.species,
        genus: animal.genus,
        birthDate: animal.birthDate,
        deathDate: animal.deathDate,
        importedFrom: animal.importedFrom,
        importDate: animal.importDate,
        sex: animal.sex,
        behavior: animal.behavior,

        // habitat
        habitat: {
          habitatId: animal.habitatId,
          name: animal.habitatName,
          description: animal.habitatDescription,
        },

        // diet
        diet: {
          dietId: animal.dietId,
          specialNotes: animal.dietNotes,
          schedule: dietSchedule
        },

        // handlers
        handlers,

        // medical records
        medicalRecords: enrichedMedicalRecords
      };
    })
  );

  return reports;
}

/**
 * Lightweight summary: just counts and minimal attributes
 * Returns array of { animalId, commonName, species, handlerCount, medicalRecordCount }
 */
async function getAnimalReportSummary(req, _res) {
  const full = await getAnimalReport(req, _res);

  return full.map(an => ({
    animalId: an.animalId,
    commonName: an.commonName,
    species: an.species,
    handlerCount: (an.handlers || []).length,
    medicalRecordCount: (an.medicalRecords || []).length
  }));
}

export default {
  getAnimalReport,
  getAnimalReportSummary
};
