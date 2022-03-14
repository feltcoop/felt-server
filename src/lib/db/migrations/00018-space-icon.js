/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE spaces
			ADD COLUMN icon text
			NOT NULL DEFAULT '🖊';
	`;
};
