/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	// Add indexes for tie ids
	await sql`
    CREATE INDEX idx_source_id
    ON ties (source_id);
  `;

	await sql`
    CREATE INDEX idx_dest_id
    ON ties (dest_id);
  `;

	await sql`
    ALTER TABLE ties
    ADD CONSTRAINT UC_ties UNIQUE (source_id,dest_id,type);
  `;
};
