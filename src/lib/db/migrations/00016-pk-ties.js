/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
    ALTER TABLE ties
    DROP CONSTRAINT UC_ties;
  `;

	await sql`
    ALTER TABLE ties 
    ADD PRIMARY KEY (source_id,dest_id,type);
  `;
};
