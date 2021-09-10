import {toRandomSeeded} from '@feltcoop/felt/util/randomSeeded.js';

// TODO upstream to Felt -- need to figure out patterns with seed and swappable prng
export const randomHue = (seed?: any): number => toRandomSeeded(seed)() * 360; // TODO random int
