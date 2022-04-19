import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {parseSvast} from '$lib/util/parseSvast';

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

test__parseSvast('parses https:// links', async () => {
	const parsed = parseSvast({
		value: 'https://felt.dev/some-link',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'Link',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{type: 'text', value: 'https://felt.dev/some-link'}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [{type: 'text', value: 'https://felt.dev/some-link'}],
			},
		],
	});
});

test__parseSvast('parses http:// links', async () => {
	const parsed = parseSvast({
		value: 'http://felt.dev/some-link',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'Link',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{type: 'text', value: 'http://felt.dev/some-link'}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [{type: 'text', value: 'http://felt.dev/some-link'}],
			},
		],
	});
});
test__parseSvast('parses absolute links', async () => {
	const parsed = parseSvast({
		value: '/felt.dev/some-link',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'Link',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{type: 'text', value: '/felt.dev/some-link'}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [{type: 'text', value: '/felt.dev/some-link'}],
			},
		],
	});
});

test__parseSvast('parses a SVAST with links and preserves whitespace', async () => {
	const parsed = parseSvast({
		value:
			'<BigPenguinInATrenchboat>link to <p> /sveveral/little/penguins\n<span>https://sveveral.more</span></p> in\nplain   text  \n  </BigPenguinInATrenchboat />',
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
					{type: 'text', value: 'link to '},
					{
						type: 'svelteElement',
						tagName: 'p',
						properties: [],
						selfClosing: false,
						children: [
							{
								type: 'svelteElement',
								tagName: 'span',
								properties: [],
								selfClosing: false,
								children: [
									{type: 'text', value: ' '},
									{
										type: 'svelteComponent',
										tagName: 'Link',
										properties: [
											{
												type: 'svelteProperty',
												name: 'href',
												value: [{type: 'text', value: '/sveveral/little/penguins'}],
												modifiers: [],
												shorthand: 'none',
											},
										],
										selfClosing: false,
										children: [{type: 'text', value: '/sveveral/little/penguins'}],
									},
									{type: 'text', value: '\n'},
								],
							},
							{
								type: 'svelteElement',
								tagName: 'span',
								properties: [],
								selfClosing: false,
								children: [
									{
										type: 'svelteComponent',
										tagName: 'Link',
										properties: [
											{
												type: 'svelteProperty',
												name: 'href',
												value: [{type: 'text', value: 'https://sveveral.more'}],
												modifiers: [],
												shorthand: 'none',
											},
										],
										selfClosing: false,
										children: [{type: 'text', value: 'https://sveveral.more'}],
									},
								],
							},
						],
					},
					{type: 'text', value: ' in\nplain   text  \n  '},
				],
			},
		],
	});
});

test__parseSvast('does not parse https:// links in properties', async () => {
	const parsed = parseSvast({
		value: '<a href="https://felt.dev/some-link" />',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteElement',
				tagName: 'a',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{type: 'text', value: 'https://felt.dev/some-link'}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: true,
				children: [],
			},
		],
	});
});

test__parseSvast.run();
/* test__parseSvast */
