/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE spaces
		ALTER COLUMN content TYPE jsonb USING content::jsonb;
	`;

	await sql`
		ALTER TABLE spaces RENAME COLUMN content TO view;
	`;

	await sql`
		UPDATE spaces 
		SET view = jsonb_set(view,'{mediaType}',to_jsonb(media_type));
	`;

	await sql`
		ALTER TABLE spaces DROP COLUMN media_type;
	`;
};
