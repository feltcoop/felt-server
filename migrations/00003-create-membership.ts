exports.up = async (sql) => {
	const createMembershipsResult = await sql`
		create table if not exists memberships (
			persona_id int references personas (persona_id) ON UPDATE CASCADE ON DELETE CASCADE,
			community_id int references communities (community_id) ON UPDATE CASCADE,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp,
			CONSTRAINT membership_pkey PRIMARY KEY (persona_id,community_id)
		)	
	`;

	if (createMembershipsResult.count) {
		log.trace('createMembershipsResult', createMembershipsResult);
	}
};

exports.down = async (sql) => {
	sql`
	drop table memberships
	`;
};
