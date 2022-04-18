import type {SvelteChild, Text} from 'svast';
import {parse} from 'svelte-parse';
import {walk} from 'estree-walker';

// TODO is there a better way to do this?
// avoids infinite walking because without it,
// it walks the newly added children, which may cause new Felt children...
const ADDED_BY_FELT = Symbol();

export const parseSvast: typeof parse = (opts) => {
	const ast = parse(opts);
	walk(ast, {
		enter(node, parent, prop, index) {
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
	let hasMatch = false;
	const words = node.value.split(MATCH_WHITESPACE);
	// First iterate and detect if there's anything to transform.
	// If not, exit early and return the original node unchanged.
	// TODO BLOCK restructure this so it's not needed
	for (const word of words) {
		if (word.startsWith('/') || word.startsWith('https://') || word.startsWith('http://')) {
			hasMatch = true;
			break;
		}
	}
	if (!hasMatch) return node;
	let plainText = '';
	const flushPlainText = () => {
		if (plainText) {
			children.push({type: 'text', value: plainText});
			plainText = '';
		}
	};
	const children: SvelteChild[] = [];
	for (const word of words) {
		console.log(`word`, word);
		if (word.startsWith('/') || word.startsWith('https://') || word.startsWith('http://')) {
			flushPlainText();
			children.push({
				[ADDED_BY_FELT]: true,
				type: 'svelteComponent',
				tagName: 'Link',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{[ADDED_BY_FELT]: true, type: 'text', value: word}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [{[ADDED_BY_FELT]: true, type: 'text', value: word}],
			});
		} else {
			plainText += word;
		}
	}
	// console.log(`words`, words, words.matches); // TODO insert old plain text
	flushPlainText();
	return {
		type: 'svelteElement',
		tagName: 'span',
		properties: [],
		selfClosing: false,
		children,
	};
};

const MATCH_WHITESPACE = /(\s+)/u;
