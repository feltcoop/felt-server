/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	// add `type` column to communities
	// TODO use enums 'standard' | 'personal'
	await sql`
		ALTER TABLE communities
			ADD type text NOT NULL DEFAULT 'standard';
	`;
	// add `type` column to personas
	// TODO use enums 'account' | 'community'
	await sql`
		ALTER TABLE personas
			ADD type text NOT NULL DEFAULT 'account';
	`;
	// add `community_id` column to personas
	await sql`
		ALTER TABLE personas
			ADD community_id int REFERENCES communities (community_id) ON UPDATE CASCADE ON DELETE CASCADE;
	`;
	// set `community_id` for all 'account' personas
	await sql`
		UPDATE personas p
			SET community_id = c.community_id
			FROM communities c
			WHERE p.name = c.name AND p.name IN (SELECT c2.name FROM communities c2 JOIN personas p2 ON p2.name = c2.name);
	`;
	// create a persona of type 'community' for every community that doesn't have one of the same name
	await sql`
		INSERT INTO personas (name, community_id, type)
			SELECT name, community_id, 'community'
			FROM communities c2
			WHERE c2.name NOT IN (SELECT c2.name FROM communities c2 JOIN personas p ON p.name = c2.name);
	`;
	// // set the type and `persona_id` reference of each 'personal' community
	await sql`
		UPDATE communities c
			SET type = 'personal'
			FROM personas p
			WHERE p.type = 'account' AND c.name = p.name;
	`;
};
