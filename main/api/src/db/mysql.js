import mysql from 'mysql2/promise';

const [host, user, password, database, port] = [
	process.env.MYSQL_HOST,
	process.env.MYSQL_USER,
	process.env.MYSQL_PASSWORD,
	process.env.MYSQL_DATABASE,
	process.env.MYSQL_PORT,
];

if (!host || !user || !password || !database || !port) {
	throw new Error(
		'Missing required environment variables for MySQL connection.'
	);
}

export const db = await mysql.createConnection({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	port: process.env.MYSQL_PORT,
});
