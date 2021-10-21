exports.up = async (sql) => {
	const createAccountsTableResult = await sql`
		create table if not exists accounts (
		account_id serial primary key,
			name text,
			password text,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)
	`;

	if (createAccountsTableResult.count) {
		log.trace('createAccountsTableResult', createAccountsTableResult);
	}
};

exports.down = async (client) => {
	client`drop table accounts`;
};
