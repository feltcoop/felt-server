import type {Service} from '$lib/server/service';
import {create_community_service} from '$lib/vocab/community/community_middleware';
import {create_file_service} from '$lib/vocab/file/fileMiddleware';

// TODO maybe extract this to decouple from the logic below?
export const service_handlers: {[key: string]: Service} = {
	create_community: create_community_service,
	create_file: create_file_service,
};
