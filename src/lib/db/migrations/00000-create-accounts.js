/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		create table if not exists accounts (
		account_id serial primary key,
			name text UNIQUE,
			password text,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)
	`;
};
