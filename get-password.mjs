import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const result = await connection.query("SELECT password FROM documents WHERE slug = 'default'");
console.log('Password:', result[0][0]?.password);
await connection.end();
