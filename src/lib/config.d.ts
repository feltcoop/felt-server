// TODO maybe use codegen to create this and `.production.` and `.development.` versions of the config
declare module 'src/lib/config.json' {
	const data: {
		development: {
			SVELTEKIT_SERVER_HOST: string;
			API_SERVER_HOST: string;
			WEBSOCKET_URL: string;
		};
		production: {
			SVELTEKIT_SERVER_HOST: string;
			API_SERVER_HOST: string;
			WEBSOCKET_URL: string;
			DEPLOY_SERVER_HOST: string;
			DEPLOY_IP: string;
			DEPLOY_USER: string;
		};
	};
	export default data;
}
