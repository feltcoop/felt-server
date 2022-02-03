/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE spaces
		DROP COLUMN media_type;
	`;
};
