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
	// TODO delete communities/personas that have a duplicate name first
	// create a persona of type 'community' for every community that doesn't have one of the same name
	await sql`
		INSERT INTO personas (name, type)
			SELECT name, 'community' FROM communities
			WHERE name NOT IN (SELECT c.name FROM communities c JOIN personas p ON p.name = c.name)
	`;
	// TODO broken -- does this go before the previous one?
	// set the type of each personal community and their `persona_id` reference
	await sql`
		UPDATE communities c
			SET type = 'personal', persona_id = p.persona_id
			FROM personas p 
			WHERE c.name = p.name;
	`;
};

/*

SELECT * from communities WHERE name NOT IN (SELECT c.name FROM communities c JOIN personas p ON p.name = c.name)


TODO remove all of this

SELECT c.name, 'community' FROM communities c JOIN personas p ON p.name = c.name

SELECT c.name FROM communities c JOIN personas p ON p.name = c.name;

SELECT name FROM personas;

SELECT name FROM communities;

INSERT INTO personas (name, type)
  VALUES (
  	'hey', 'community'
  );


DELETE FROM personas WHERE name = 'hey';


INSERT INTO personas (name, type)
	(SELECT c.name, 'community' FROM communities c JOIN personas p ON p.name = c.name);

*/
