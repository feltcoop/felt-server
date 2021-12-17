/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`ALTER TABLE files RENAME TO entities;`;
};
