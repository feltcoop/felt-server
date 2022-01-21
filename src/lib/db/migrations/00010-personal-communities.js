/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		CREATE TYPE community_type AS ENUM ('standard', 'personal');
	`;
	await sql`
		CREATE TYPE persona_type AS ENUM ('account', 'community');
	`;
	// Add `type` column to communities.
	await sql`
		ALTER TABLE communities
			ADD type community_type NOT NULL DEFAULT 'standard';
	`;
	// Add `type` column to personas.
	await sql`
		ALTER TABLE personas
			ADD type persona_type NOT NULL DEFAULT 'account';
	`;
	// Add `community_id` column to personas.
	await sql`
		ALTER TABLE personas
			ADD community_id int REFERENCES communities (community_id) ON UPDATE CASCADE ON DELETE CASCADE;
	`;
	// Set `community_id` for all 'account' personas.
	await sql`
		UPDATE personas p
			SET community_id = c.community_id
			FROM communities c
			WHERE p.name = c.name;
	`;
	// Create a persona of type 'community' for every community that doesn't have one of the same name.
	await sql`
		INSERT INTO personas (name, community_id, type)
			SELECT name, community_id, 'community'
			FROM communities c2
			WHERE c2.name NOT IN (SELECT c2.name FROM communities c2 JOIN personas p ON p.name = c2.name);
	`;
	// Set the type of each 'personal' community.
	await sql`
		UPDATE communities c
			SET type = 'personal'
			FROM personas p
			WHERE p.type = 'account' AND c.name = p.name;
	`;
};
