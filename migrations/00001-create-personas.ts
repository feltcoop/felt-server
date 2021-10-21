exports.up = async (sql) => {
	const createPersonasTableResult = await sql`
		create table if not exists personas (
			persona_id serial primary key,
			account_id int,
			name text,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)
	`;

	if (createPersonasTableResult.count) {
		log.trace('createPersonasTableResult', createPersonasTableResult);
	}
};

exports.down = async (sql) => {
	sql`
	drop table personas
	`;
};
