/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	// TODO make this a json "properties" or "settings" field instead?
	// what if every community had a `personal` attribute and `hue` attribute?
	await sql`
		ALTER TABLE communities
			ADD COLUMN hue integer
			NOT NULL;
	`;
	// TODO can this be done in the `ADD COLUMN` statement?
	// maybe omit `SET`
	await sql`
		ALTER TABLE communities
			ALTER COLUMN hue
			SET DEFAULT floor(random() * 360)::int;
	`;
};
