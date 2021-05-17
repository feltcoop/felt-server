import {writable} from 'svelte/store';

import type {Post} from '../posts/post.js';

// TODO export a pure creator function instead of this global
// TODO custom store probably, but how generic?
export const posts = writable<Post[]>([]);
