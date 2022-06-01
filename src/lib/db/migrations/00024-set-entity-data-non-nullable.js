/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE entities ALTER COLUMN data SET NOT NULL
	`;
};
