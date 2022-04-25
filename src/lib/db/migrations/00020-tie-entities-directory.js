/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	const spaces = await sql`
		SELECT * FROM spaces;
	`;

	for (const space of spaces) {
		// eslint-disable-next-line no-await-in-loop
		await sql`
		WITH spaceEntities (entity_id) 
		AS (SELECT entity_id FROM entities e WHERE e.space_id = ${space.space_id} AND e.data ->> 'type' != 'Directory')
		INSERT INTO ties (source_id, dest_id, type)
		SELECT ${space.directory_id},entity_id,'HasItem' FROM spaceEntities 		
		WHERE spaceEntities.entity_id NOT IN (
			SELECT t.dest_id 
			FROM ties t 
			JOIN spaceEntities 
			ON spaceEntities.entity_id = t.dest_id
		) ;
		`;
	}
};
