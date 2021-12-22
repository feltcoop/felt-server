/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE entities
			ADD COLUMN type VARCHAR(50)
			NOT NULL DEFAULT 'Message';
	`;
};
