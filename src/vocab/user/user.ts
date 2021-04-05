export interface User {
	name: string;
	// TODO don't send this to clients! enforce with code generation from JSON schema,
	// marking this property as "server" or "private", or a sensitivity rating of 3
	secret: string;
}
