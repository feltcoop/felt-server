/// <reference types="@sveltejs/kit" />
// import '@sveltejs/kit';
import type {ClientSession} from '$lib/session/clientSession';

declare namespace App {
	// interface Locals {}

	// interface Platform {}

	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Session extends ClientSession {}

	// interface Stuff {}
}
