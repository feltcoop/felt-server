import ManageMembershipForm from '$lib/ui/ManageMembershipForm.svelte';
import type {SvelteComponent} from 'svelte';

// The collection of components that can be dynamically mounted by the app.

// TODO refactor this to load these components on demand,
// instead of preloading the entire component library

export const components: {[key: string]: typeof SvelteComponent} = {
	ManageMembershipForm,
};
