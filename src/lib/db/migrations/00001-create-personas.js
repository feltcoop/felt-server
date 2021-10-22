/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		create table if not exists personas (
			persona_id serial primary key,
			account_id int,
			name text UNIQUE,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)
	`;

	await sql`
		CREATE
		INDEX ON personas (LOWER(name));
	`;
};
