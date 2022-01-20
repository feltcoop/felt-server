/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	// add `type` column to communities
	await sql`
		ALTER TABLE communities
			ADD COLUMN type text NOT NULL DEFAULT 'standard';
	`;
	// add `persona_id` column to communities
	// TODO should this be NOT NULL ? (also see `space` migration)
	await sql`
		ALTER TABLE communities
			ADD persona_id int REFERENCES personas (persona_id) ON UPDATE CASCADE ON DELETE CASCADE;
	`;
	// add `type` column to personas
	await sql`
		ALTER TABLE personas
			ADD COLUMN type text NOT NULL DEFAULT 'account';
	`;
	// create a persona of type 'community' for every community that doesn't have one of the same name
	await sql`
		INSERT INTO personas (name, type)
			SELECT name, 'community' FROM communities
			WHERE name NOT IN (SELECT c.name FROM communities c JOIN personas p ON p.name = c.name);
	`;
	// set the `persona_id` reference of each 'standard' community
	await sql`
		UPDATE communities c
			SET persona_id = p.persona_id
			FROM personas p
			WHERE c.persona_id IS NULL AND p.type = 'community' AND c.name = p.name;
	`;
	// set the type and `persona_id` reference of each personal community
	await sql`
		UPDATE communities c
			SET type = 'personal', persona_id = p.persona_id
			FROM personas p 
			WHERE c.persona_id IS NULL AND p.type = 'account' AND c.name = p.name;
	`;
};
