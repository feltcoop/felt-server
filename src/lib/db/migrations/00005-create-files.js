/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		create table if not exists files (
			file_id serial primary key,
			content text,
			actor_id int,
			space_id int references spaces (space_id) ON UPDATE CASCADE ON DELETE CASCADE,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)	
	`;
};
