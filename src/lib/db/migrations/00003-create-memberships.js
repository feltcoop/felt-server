/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		create table if not exists memberships (
			persona_id int references personas (persona_id) ON UPDATE CASCADE ON DELETE CASCADE,
			community_id int references communities (community_id) ON UPDATE CASCADE,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp,
			CONSTRAINT membership_pkey PRIMARY KEY (persona_id,community_id)
		)	
	`;
};
