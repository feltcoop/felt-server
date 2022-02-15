/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
	CREATE TABLE IF NOT EXISTS ties (
		source_id int,
		destination_id int,
		type text,
		created timestamp NOT NULL DEFAULT now(),
		updated timestamp		
	)
	`;
};
