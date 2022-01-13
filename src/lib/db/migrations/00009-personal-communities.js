/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	// TODO add `type` and `persona_id` to all communities
	await sql`
		ALTER TABLE communities
			ADD COLUMN type text
			NOT NULL DEFAULT 'standard';
	`;
	// TODO update all communities that should be type 'personal'
};
