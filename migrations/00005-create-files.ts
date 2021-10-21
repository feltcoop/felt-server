exports.up = async (sql) => {
	const createFilesTableResult = await sql`
		create table if not exists files (
			file_id serial primary key,
			content text,
			actor_id int,
			space_id int references spaces (space_id) ON UPDATE CASCADE ON DELETE CASCADE,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)	
	`;

	if (createFilesTableResult.count) {
		log.trace('createFilesTableResult', createFilesTableResult);
	}
};

exports.down = async (sql) => {
	sql`
	drop table files
	`;
};
