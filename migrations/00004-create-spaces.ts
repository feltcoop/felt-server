exports.up = async (sql) => {
	const createSpacesTableResult = await sql`
		create table if not exists spaces (
			space_id serial primary key,
			name text,
			url text,
			media_type text,
			content text,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)	
	`;

	if (createSpacesTableResult.count) {
		log.trace('createSpacesTableResult', createSpacesTableResult);
	}

	const createCommunitySpacesTableResult = await sql`
		create table if not exists community_spaces (
			community_id int references communities (community_id) ON UPDATE CASCADE ON DELETE CASCADE,
			space_id int references spaces (space_id) ON UPDATE CASCADE,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp,
			CONSTRAINT community_spaces_pkey PRIMARY KEY (community_id,space_id)
		)	
	`;

	if (createCommunitySpacesTableResult.count) {
		log.trace('createCommunitySpacesTableResult', createCommunitySpacesTableResult);
	}
};

exports.down = async (sql) => {
	sql`
	drop table community_spaces
	`;

	sql`
	drop table spaces
	`;
};
