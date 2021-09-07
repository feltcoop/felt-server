export interface File {
	file_id: number;
	actor_id: number;
	content: string;
	space_id: number;
}

export interface FileParams {
	actor_id: number; // `persona_id` -- must be validated against the authenticated `account_id`
	space_id: number;
	content: string;
}
