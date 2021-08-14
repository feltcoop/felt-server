import {to_random_seeded} from '@feltcoop/felt/util/random_seeded.js';

// TODO upstream to Felt -- need to figure out patterns with seed and swappable prng
export const random_hue = (seed?: any): number => to_random_seeded(seed)() * 360; // TODO random int
