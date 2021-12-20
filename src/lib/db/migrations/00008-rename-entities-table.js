/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`ALTER TABLE files RENAME TO entities;`;
	await sql`ALTER TABLE entities RENAME COLUMN file_id TO entity_id;`;
};
