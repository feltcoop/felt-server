/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE entities
		DROP COLUMN space_id;
	`;
};
