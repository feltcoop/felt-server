exports.up = async (sql) => {
	const createCommunitiesTableResult = await sql`
		create table if not exists communities (
			community_id serial primary key,
			name text,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)	
	`;

	if (createCommunitiesTableResult.count) {
		log.trace('createCommunitiesTableResult', createCommunitiesTableResult);
	}
};

exports.down = async (sql) => {
	sql`
	drop table communities
	`;
};
