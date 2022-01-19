/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
	 UPDATE entities
	 SET content = concat('{"type":"Post","partOf":null,"content":"',content,'"}');
	 `;

	await sql`
	ALTER TABLE entities
	ALTER COLUMN content TYPE jsonb USING content::jsonb;
	`;

	await sql`ALTER TABLE entities RENAME COLUMN content TO data;`;
};
