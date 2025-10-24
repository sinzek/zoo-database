import { query } from '../db/mysql.js';

/**
 * Creates a new record in the specified table with the provided data.
 * Please ensure that the data object keys match the table column names,
 * and that all required fields are included. **Note that the order of fields in the object must match the order in our schema.**
 * @param {object} data
 * @param {string} tableName The name of the table to insert into (e.g., 'Uer', 'Employee', 'Customer', etc.)
 * @throws If the insert fails
 */
export async function createOneQuery(tableName, data) {
	if (!data || Object.keys(data).length === 0) {
		throw new Error('Data object must have at least one field to insert');
	}

	const columns = Object.keys(data);
	const values = Object.values(data);
	const placeholders = columns.map(() => '?').join(', ');

	const [result] = await query(
		`
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES(${placeholders});
        `,
		values
	);

	if (result.affectedRows === 0) {
		throw new Error(`Failed to insert new record into ${tableName} table`);
	}
}

/**
 * Retrieves n records from the specified table by a given key column and value.
 * @param {string} tableName The name of the table to query (e.g., 'User', 'Employee', 'Customer', etc.)
 * @param {string} keyColumn Column name to search by (e.g., 'userId', 'employeeId', etc.)
 * @param {any} keyValue Value to search for in the keyColumn
 * @param {boolean} excludeDeleted Whether to exclude rows with deletedAt IS NOT NULL (default: true)
 * @returns {Promise<Array>} Promise<Array of records matching the query>
 * @throws If no records are found
 */
export async function getNByKeyQuery(
	tableName,
	keyColumn,
	keyValue,
	excludeDeleted = true
) {
	const rows = await query(
		`
		SELECT *
		FROM ${tableName}
		WHERE ${keyColumn} = ?${excludeDeleted ? ` AND deletedAt IS NULL` : ''};
		`,
		[keyValue]
	);

	// no rows found
	if (!rows || rows.length === 0 || !rows[0]) {
		throw new Error(
			`No records found in ${tableName} with ${keyColumn} = ${keyValue}`
		);
	}

	return rows;
}

/**
 * Retrieves all records from the specified table.
 * @param {string} tableName The name of the table to query (e.g., 'User', 'Employee', 'Customer', etc.)
 * @param {boolean} excludeDeleted Whether to exclude rows with deletedAt IS NOT NULL (default: true)
 * @returns {Promise<Array>} Promise<Array of records>
 * @throws If no records are found
 */
export async function getAllQuery(tableName, excludeDeleted = true) {
	const rows = await query(
		`
		SELECT *
		FROM ${tableName}
		WHERE 1=1${excludeDeleted ? ` AND deletedAt IS NULL` : ''};
		`
	);

	// no rows found
	if (!rows || rows.length === 0 || !rows[0]) {
		throw new Error(`No records found in ${tableName}`);
	}

	return rows;
}

/**
 * Updates a record in the specified table with the provided data, identified by the key column. Please ensure that the data object keys match the table column names, and that all required fields are included.
 * (order of fields does not matter here i'm pretty sure)
 * @param {string} tableName The name of the table to update (e.g., 'User', 'Employee', 'Customer', etc.)
 * @param {object} data Object containing the data to update. Must include the field of the provided keyColumn. keyColumn field will not be updated.
 * @param {string} keyColumn Column name to identify the record (e.g., 'userId', 'employeeId', etc.)
 * @param {boolean} excludeDeleted Whether to exclude rows with deletedAt IS NOT NULL (default: true)
 * @throws If the update fails
 */
export async function updateOneQuery(
	tableName,
	data,
	keyColumn,
	excludeDeleted = true
) {
	let columns = Object.keys(data);
	let values = Object.values(data);

	if (columns[keyColumn] === undefined) {
		throw new Error(
			`Data object must include the key column: ${keyColumn}`
		);
	}

	// remove keyColumn from columns and values to avoid updating it
	columns = columns.filter((col) => col !== keyColumn);
	values = Object.values(data).filter(
		(_x, idx) => columns[idx] !== keyColumn
	);
	const setClause = columns.map((col) => `${col} = ?`).join(', ');

	const [result] = await query(
		`
		UPDATE ${tableName}
		SET ${setClause}
		WHERE ${keyColumn} = ?${excludeDeleted ? ` AND deletedAt IS NULL` : ''}`,
		[...values, data[keyColumn]]
	);

	if (result.affectedRows === 0) {
		throw new Error(
			`Failed to update record in ${tableName} where ${keyColumn} = ${data[keyColumn]}`
		);
	}
}

/**
 * SOFT deletes a record from the specified table by a given key column and value. Table must support soft deletes (i.e., have a deletedAt column).
 * @param {string} tableName The name of the table to delete from (e.g., 'User', 'Employee', 'Customer', etc.)
 * @param {string} keyColumn Column name to identify the record (e.g., 'userId', 'employeeId', etc.)
 * @param {any} keyValue Value to identify the record in the keyColumn
 * @throws If the delete fails
 */
export async function deleteOneQuery(tableName, keyColumn, keyValue) {
	const [result] = await query(
		`
		UPDATE ${tableName}
		SET deletedAt = CURRENT_DATE()
		WHERE ${keyColumn} = ? AND deletedAt IS NULL
		`,
		[keyValue]
	);

	if (result.affectedRows === 0) {
		throw new Error(
			`Failed to delete record in ${tableName} where ${keyColumn} = ${keyValue}`
		);
	}
}
