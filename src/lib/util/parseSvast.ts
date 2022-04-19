import type {SvelteChild, Text} from 'svast';
import {parse} from 'svelte-parse';
import {walk} from 'estree-walker';

// Used to avoids infinite loops because newly added children get walked.
const ADDED_BY_FELT = Symbol();

export const parseSvast: typeof parse = (opts) => {
	const ast = parse(opts);
	walk(ast, {
		enter(node, parent, prop, index) {
			// TODO BLOCK ignore nodes that are properties
			if (node[ADDED_BY_FELT]) return;
			if (node.type === 'text') {
				// parse this text and if it has extended syntax, replace the node with N new ones
				const newNode = parseSvastText(node);
				if (newNode !== node) {
					this.replace(newNode);
				}
			}
		},
	});
	return ast;
};

/**
 * Parses plain text from a Felt-specific format into a SVAST.
 * This is a hacky initial implementation just to get links and mentions.
 * We plan to use MDsveX/Pfm to do this robustly/correctly:
 * https://github.com/pngwn/MDsveX/
 * @param value
 */
const parseSvastText = (node: Text): SvelteChild => {
	const words = node.value.split(MATCH_WHITESPACE);
	let plainText = '';
	let children: SvelteChild[] | undefined;
	const flushPlainText = () => {
		if (!plainText) return;
		(children || (children = [])).push({
			[ADDED_BY_FELT as any]: true,
			type: 'text',
			value: plainText,
		});
		plainText = '';
	};
	for (const word of words) {
		if (word.startsWith('/') || word.startsWith('https://') || word.startsWith('http://')) {
			flushPlainText();
			(children || (children = [])).push({
				[ADDED_BY_FELT as any]: true,
				type: 'svelteComponent',
				tagName: 'Link',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{[ADDED_BY_FELT as any]: true, type: 'text', value: word}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [{[ADDED_BY_FELT as any]: true, type: 'text', value: word}],
			});
		} else {
			plainText += word;
		}
	}
	if (!children) return node; // nothing special was parsed
	flushPlainText();
	return children.length === 1
		? children[0]
		: {
				[ADDED_BY_FELT as any]: true,
				type: 'svelteElement',
				tagName: 'span',
				properties: [],
				selfClosing: false,
				children,
		  };
};

const MATCH_WHITESPACE = /(\s+)/u;
