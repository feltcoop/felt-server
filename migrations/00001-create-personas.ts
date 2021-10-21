exports.up = async (sql) => {
	const createPersonasTableResult = await sql`
		create table if not exists personas (
			persona_id serial primary key,
			account_id int,
			name text UNIQUE,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)
	`;

	if (createPersonasTableResult.count) {
		log.trace('createPersonasTableResult', createPersonasTableResult);
	}

	const createPersonasNameIndexResult = await sql`
		CREATE
		INDEX ON personas (LOWER(name));
	`;

	if (createPersonasNameIndexResult.count) {
		log.trace('createPersonasNameIndexResult', createPersonasNameIndexResult);
	}
};

exports.down = async (sql) => {
	sql`
	drop table personas
	`;
};
