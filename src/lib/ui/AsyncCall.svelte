<script lang="ts">
	type T = $$Generic;

	export let fn: () => T;

	let errorMessage: string | undefined;
	let pending: boolean | undefined;

	const call = (): T => {
		const returned: any = fn();
		if (!returned || !returned.then) return returned;
		pending = true;
		errorMessage = '';
		return returned.then((result: any) => {
			if (!result.ok) {
				errorMessage = result.message || 'unknown error';
			}
			pending = false;
			return result;
		});
	};
</script>

<slot {pending} {call} {errorMessage} />
