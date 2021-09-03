import {toRandomSeeded} from '@feltcoop/felt/util/randomSeeded.js';

// TODO upstream to Felt -- need to figure out patterns with seed and swappable prng
export const random_hue = (seed?: any): number => toRandomSeeded(seed)() * 360; // TODO random int
