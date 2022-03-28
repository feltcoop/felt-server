/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE entities
		ALTER COLUMN actor_id SET NOT NULL	
	`;

	await sql`
		ALTER TABLE spaces
			ADD COLUMN directory_id int REFERENCES entities (entity_id)
	`;

	const spaces = await sql`
		SELECT * FROM spaces;
	`;

	for (const space of spaces) {
		// eslint-disable-next-line no-await-in-loop
		const actorPersona = await sql`
			SELECT persona_id FROM personas WHERE community_id = ${space.community_id};
		`;

		// eslint-disable-next-line no-await-in-loop
		const entity = await sql`
			INSERT INTO entities (actor_id, data) VALUES (
			${actorPersona[0].persona_id},${sql.json({type: 'Collection', name: 'directory'})}
		) RETURNING *
		`;

		const directory_id = entity[0].entity_id;
		//associate it with the space
		sql`
				UPDATE spaces
				SET directory_id=${directory_id}
				WHERE space_id=${space.space_id}
		`;
	}
};
