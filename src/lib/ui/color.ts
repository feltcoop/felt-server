import {toRandomSeeded} from '@feltcoop/felt/util/randomSeeded.js';

// TODO upstream to Felt -- need to figure out patterns with seed and swappable prng,
// and refactor this to use a random int
export const randomHue = (seed: Object = ''): number => Math.round(toRandomSeeded(seed)() * 360);
