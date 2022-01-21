/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	// Set persona.account_id foreign key.
	await sql`
		ALTER TABLE personas
		ADD CONSTRAINT personas_account_id_fkey
			FOREIGN KEY (account_id)
			REFERENCES accounts (account_id)
			ON UPDATE CASCADE ON DELETE CASCADE;
	`;

	// Make membership cascade on delete community_id.
	await sql`
		ALTER TABLE memberships
		DROP CONSTRAINT memberships_community_id_fkey,
		ADD CONSTRAINT memberships_community_id_fkey
			FOREIGN KEY (community_id)
			REFERENCES communities (community_id)
			ON UPDATE CASCADE ON DELETE CASCADE;
	`;
};
