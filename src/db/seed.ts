import type {ApiServer} from 'src/server/ApiServer';

export const seed = async (server: ApiServer): Promise<void> => {
	const {db} = server;
	const {sql} = db;

	console.log('[seed] adding initial dataset to database');

	// example: create table
	const createAccountsTableResult = await sql`
  create table if not exists accounts (
    name text,
    password text
  )
`;
	if (createAccountsTableResult.count) {
		console.log('[db] createAccountsTableResult', createAccountsTableResult);
	}

	// example: select
	interface AccountDoc {
		name: string;
		password: string;
	}
	const accountDocs: AccountDoc[] = await sql`
  select name, password from accounts
`;
	console.log('[db] accountDocs', accountDocs);

	// example: insert literal values
	const account1Doc = accountDocs.find((d) => d.name === 'account1');
	if (!account1Doc) {
		const account1InitialData = {name: 'account1', password: 'HASHVALUE1'};
		const createAccount1Result = await sql`
    insert into accounts (
      name, password
    ) values (
      ${account1InitialData.name}, ${account1InitialData.password}
    )
  `;
		console.log('[db] createAccount1Result', createAccount1Result);
	}

	// example: insert with dynamic query helper
	const account2Doc = accountDocs.find((d) => d.name === 'account2');
	if (!account2Doc) {
		const account2: AccountDoc = {name: 'account2', password: 'HASHVALUE2'};
		const account2Result = await sql`
    insert into accounts ${sql(account2, 'name', 'password')}
  `;
		console.log('[db] createAccount2Result', account2Result);
	}

	// example: select after inserting
	// don't double print:
	if (!accountDocs.length) {
		const accountDocs: AccountDoc[] = await sql`
    select name, password from accounts
  `;
		console.log('[db] accountDocs', accountDocs);
	}
};
