/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE entities RENAME COLUMN actor_id TO persona_id;
	`;
};
