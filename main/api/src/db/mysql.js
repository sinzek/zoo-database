import mysql from 'mysql2/promise';

console.log('--- Checking Environment Variables ---');
console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_USER:', process.env.MYSQL_USER);
console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD); // Be careful logging passwords, even locally
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
console.log('------------------------------------');

const [host, user, password, database, port] = [
	process.env.MYSQL_HOST,
	process.env.MYSQL_USER,
	process.env.MYSQL_PASSWORD,
	process.env.MYSQL_DATABASE,
	process.env.MYSQL_PORT,
];

if (!host || !user || password === undefined || !database || !port) {
	console.error('!!! Check FAILED !!!'); 
	throw new Error(
		'Missing required environment variables for MySQL connection.'
	);
}

/**
 * Database connection pool
 * @type {mysql.Connection}
 */
export const db = await mysql.createConnection({
	host,
	user,
	password,
	database,
	port,
	multipleStatements: true, // allow executing multiple SQL statements in one query
	rowsAsArray: false, // return rows as objects instead of arrays
});

export async function query(sql, params) {
	const [result, info] = await db.query(sql, params);
	
	// For SELECT queries, just return the result
	// For INSERT/UPDATE/DELETE queries, return the result with info
	return result;
}
