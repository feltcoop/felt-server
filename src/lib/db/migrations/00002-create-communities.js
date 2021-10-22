/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		create table if not exists communities (
			community_id serial primary key,
			name text,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)	
	`;
};
