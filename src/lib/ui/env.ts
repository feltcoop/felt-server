// `import.meta.env` doesn't work in Svelte components yet,
// so we're re-exporting them here. For more see:
// https://github.com/sveltejs/kit/issues/720

export const WEBSOCKET_URL: string = 'ws://localhost:3001/ws'; // import.meta.env.VITE_WEBSOCKET_URL as string;
