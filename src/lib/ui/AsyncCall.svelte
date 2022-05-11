<script lang="ts">
	import type {Result} from '@feltcoop/felt';

	type T = $$Generic<Result>;

	export let fn: () => Promise<T>;

	let errorMessage: string | undefined;
	let pending: boolean | undefined;

	const call = async (): Promise<T> => {
		pending = true;
		errorMessage = '';
		const result = await fn();
		if (!result.ok) {
			errorMessage = (result as any).message || 'unknown error';
		}
		pending = false;
		return result;
	};
</script>

<slot {pending} {call} {errorMessage} />
