/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE spaces
		ALTER COLUMN content TYPE jsonb USING content::jsonb;
	`;

	await sql`
		ALTER TABLE spaces RENAME COLUMN content TO view;
	`;
};
