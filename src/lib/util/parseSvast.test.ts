import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {parseSvast} from '$lib/util/parseSvast';

// TODO BLOCK stringify  won't work with our stuff without pre-trasnsformation

/* test__parseSvast */
const test__parseSvast = suite('parseSvast');

test__parseSvast('parses a normal SVAST', async () => {
	const parsed = parseSvast({
		value: '<BigPenguinInATrenchboat><SveveralLittlePenguins /></BigPenguinInATrenchboat />',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'BigPenguinInATrenchboat',
				properties: [],
				selfClosing: false,
				children: [
					{
						type: 'svelteComponent',
						tagName: 'SveveralLittlePenguins',
						properties: [],
						selfClosing: true,
						children: [],
					},
				],
			},
		],
	});
});

test__parseSvast('parses a SVAST with Felt-specific link behavior', async () => {
	const parsed = parseSvast({
		value:
			'<BigPenguinInATrenchboat>link to /sveveral/little/penguins in\nplain   text  \n  </BigPenguinInATrenchboat />',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'BigPenguinInATrenchboat',
				properties: [],
				selfClosing: false,
				children: [
					{
						type: 'svelteElement',
						tagName: 'span',
						properties: [],
						selfClosing: false,
						children: [
							{type: 'text', value: 'link to '},
							{
								type: 'svelteComponent',
								tagName: 'Link',
								properties: [
									{
										type: 'svelteProperty',
										name: 'href',
										value: [
											{
												type: 'text',
												value: '/sveveral/little/penguins',
											},
										],
										modifiers: [],
										shorthand: 'none',
									},
								],
								selfClosing: false,
								children: [
									{
										type: 'text',
										value: '/sveveral/little/penguins',
									},
								],
							},
							{
								type: 'text',
								value: ' in\nplain   text  \n  ',
							},
						],
					},
				],
			},
		],
	});
});

// TODO BLOCK mentions

test__parseSvast.run();
/* test__parseSvast */
