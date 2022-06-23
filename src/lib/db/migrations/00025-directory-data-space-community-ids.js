/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	const spaces = await sql`
		SELECT space_id,directory_id FROM spaces;
	`;

	// Add `space_id` to directory data:
	for (const space of spaces) {
		// eslint-disable-next-line no-await-in-loop
		const [directory] = await sql`
			SELECT data FROM entities WHERE entity_id=${space.directory_id};
		`;
		const data = {
			...directory.data,
			space_id: space.space_id,
			name: undefined, // remove `name` from directories
		};
		// eslint-disable-next-line no-await-in-loop
		await sql`
			UPDATE entities
			SET data=${data}
			WHERE entity_id=${space.directory_id}
		`;
	}
};
