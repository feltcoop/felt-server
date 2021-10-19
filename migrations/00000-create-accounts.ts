exports.up = async (client) => {
	client`
	create table if not exists accounts (
		account_id serial primary key,
			name text,
			password text,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)
	`;
};

exports.down = async (client) => {
	console.log('down');
};
