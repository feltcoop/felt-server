/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE communities
			ADD COLUMN settings jsonb
			NOT NULL DEFAULT '{}';
	`;
};
