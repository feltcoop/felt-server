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
		//This fixes the broken migration in #00017
		fixView(space);
		const viewText = compile(space.view);
		// eslint-disable-next-line no-await-in-loop
		await sql`
			UPDATE spaces
			SET view=${viewText}
			WHERE space_id=${space.space_id}
		`;
	}
};

//@ts-ignore
const fixView = (space) => {
	const view = space.view;
	if (typeof view === 'string') {
		//fixes 1 space w/ broken data in staging
		space.view = JSON.parse(view);
		return;
	}
	const child = view.children?.at(0);
	if (!child || child.tagName !== 'Iframe') return;
	child.children = [];
	child.selfClosing = true;
	child.properties.at(0).modifiers = [];
	child.properties.at(0).shorthand = 'none';
	const value = child.properties?.at(0)?.value;
	if (!value || Array.isArray(value)) return;
	view.children.at(0).properties.at(0).value = value.value;
};
