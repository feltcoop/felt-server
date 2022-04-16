import {toCounter} from '@feltcoop/felt/util/counter.js';
import {cyan} from 'kleur/colors';

export interface LogSequence {
	(text: string, color?: typeof cyan): string;
}

export const toLogSequence = (): LogSequence => {
	const counter = toCounter();
	return (text, color = cyan) => `echo;echo;echo '${color(`${counter()}. ${text}`)}';\n`;
};
