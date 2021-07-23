export interface Space {
	space_id: number;
	community_id: number;
	name: string;
	media_type: string; // TODO discuss
	content: string; // TODO discuss
}

// TODO think about `Space_Server_Doc`, `Space_Db_Doc`,
export interface Space_Client_Doc {
	community_id: number;
	name: string;
	media_type: string;
	content: string;
}

export interface Space_Client_Doc {
	url: string;
	media_type: string;
	content: string;
}
