/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE communities
			ADD COLUMN hue integer
			NOT NULL;
	`;
	// TODO can this be done in the `ADD COLUMN` statement?
	await sql`
		ALTER TABLE communities
			ALTER COLUMN hue
			SET DEFAULT floor(random() * 360)::int;
	`;
};
