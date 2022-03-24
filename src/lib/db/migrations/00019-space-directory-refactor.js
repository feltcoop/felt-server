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
			INSERT INTO entities (actor_id,space_id, data) VALUES (
			${actorPersona[0].persona_id},${space.space_id},${sql.json({type: 'Directory'})}
		) RETURNING *
		`;

		const directory_id = entity[0].entity_id;
		//associate it with the space
		sql`
				UPDATE spaces
				SET directory_id=${directory_id}
				WHERE space_id=${space.space_id}
		`;
		//tie all orphaned entities to the directory
		//uses a CTE to define the spaceEntities table as all entity_ids from the current space
		//then inserts new ties based on the results of
		//a query which finds all entities in a given space that don't already have a tie to a parent entity
		//i.e. top level (non-leaf) entities which should be connected to the directory
		sql`
			WITH spaceEntities (entity_id) 
			AS (SELECT entity_id FROM entities e WHERE e.space_id = ${space.space_id} AND e.data ->> 'type' != 'Directory')
			INSERT INTO ties (source_id, dest_id, type)
			SELECT ${directory_id},entity_id,'HasEntity' FROM spaceEntities 		
			WHERE spaceEntities.entity_id NOT IN (
				SELECT t.dest_id 
				FROM ties t 
				JOIN spaceEntities 
				ON spaceEntities.entity_id = t.dest_id
			) 
		`;
	}
};
