// TODO consider this `.events.` pattern
// to break it into many modules across the project's directories --
// maybe `gro gen` could automate some of the work for this usecase and similar
// with configurable extension behavior.
// (in this case, we want to aggregate all events across all `.events.` modules)

interface EventData {
	name: string;
	params: string;
	result: string;
	returns: string;
}

export const events: EventData[] = [
	{
		name: 'log_in',
		params: 'LoginRequest',
		result: 'ApiResult<{session: ClientAccountSession}>',
		returns: 'Promise<ApiResult<{session: ClientAccountSession}>>',
	},
	{
		name: 'log_out',
		params: 'void',
		result: 'ApiResult<void>',
		returns: 'Promise<ApiResult<void>>',
	},
	{
		name: 'create_community',
		params: 'Static<typeof createCommunityService.paramsSchema>',
		result: 'ApiResult<Static<typeof createCommunityService.responseSchema>>',
		returns: 'Promise<ApiResult<Static<typeof createCommunityService.responseSchema>>>',
	},
	{
		name: 'create_persona',
		params: 'Static<typeof createPersonaService.paramsSchema>',
		result: 'ApiResult<Static<typeof createPersonaService.responseSchema>>',
		returns: 'Promise<ApiResult<Static<typeof createPersonaService.responseSchema>>>',
	},
	{
		name: 'create_membership',
		params: 'Static<typeof createMembershipService.paramsSchema>',
		result: 'ApiResult<Static<typeof createMembershipService.responseSchema>>',
		returns: 'Promise<ApiResult<Static<typeof createMembershipService.responseSchema>>>',
	},
	{
		name: 'create_space',
		params: 'Static<typeof createSpaceService.paramsSchema>',
		result: 'ApiResult<Static<typeof createSpaceService.responseSchema>>',
		returns: 'Promise<ApiResult<Static<typeof createSpaceService.responseSchema>>>',
	},
	{
		name: 'create_file',
		params: 'Static<typeof createFileService.paramsSchema>',
		result: 'ApiResult<Static<typeof createFileService.responseSchema>>',
		returns: 'Promise<ApiResult<Static<typeof createFileService.responseSchema>>>',
	},
	{
		name: 'read_files',
		params: 'Static<typeof readFilesService.paramsSchema>',
		result: 'ApiResult<Static<typeof readFilesService.responseSchema>>',
		returns: 'Promise<ApiResult<Static<typeof readFilesService.responseSchema>>>',
	},
	// `query_files` differs from `read_files` in that
	// it returns a reactive store containing the requested files.
	// Its API could be expanded to give callers access to its async status or promise,
	// maybe via a third `options` arg with callbacks.
	{
		name: 'query_files',
		params: 'Static<typeof readFilesService.paramsSchema>',
		result: 'void',
		returns: 'Readable<Readable<File>[]>',
	},
	{
		name: 'toggle_main_nav',
		params: 'void',
		result: 'void',
		returns: 'void',
	},
	{
		name: 'toggle_secondary_nav',
		params: 'void',
		result: 'void',
		returns: 'void',
	},
	{
		name: 'set_main_nav_view',
		params: 'MainNavView',
		result: 'void',
		returns: 'void',
	},
	{
		name: 'set_mobile',
		params: 'boolean',
		result: 'void',
		returns: 'void',
	},
	{
		name: 'select_persona',
		params: '{persona_id: number}',
		result: 'void',
		returns: 'void',
	},
	{
		name: 'select_community',
		params: '{community_id: number | null}',
		result: 'void',
		returns: 'void',
	},
	{
		name: 'select_space',
		params: '{community_id: number, space_id: number}',
		result: 'void',
		returns: 'void',
	},
];
