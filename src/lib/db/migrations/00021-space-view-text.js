import {compile} from 'svast-stringify';

/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	const spaces = await sql`
		SELECT * FROM spaces;
	`;

	await sql`
		ALTER TABLE spaces
		ALTER COLUMN view TYPE text;
  `;

	for (const space of spaces) {
		const viewText = compile(space.view);
		// eslint-disable-next-line no-await-in-loop
		await sql`
			UPDATE spaces
			SET view=${viewText}
			WHERE space_id=${space.space_id}
		`;
	}
};
