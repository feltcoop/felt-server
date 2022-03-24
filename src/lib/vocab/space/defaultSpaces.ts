import {parseView, viewTemplates, type ViewData} from '$lib/vocab/view/view';
import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Community} from '$lib/vocab/community/community';

export const toDefaultSpaces = ({community_id, name}: Community): CreateSpaceParams[] => [
	{
		community_id,
		name,
		url: '/',
		...toViewTemplateDefaults('Home'),
	},
	{
		community_id,
		name: 'room',
		url: '/room',
		...toViewTemplateDefaults('Room'),
	},
	{
		community_id,
		name: 'board',
		url: '/board',
		...toViewTemplateDefaults('Board'),
	},
	{
		community_id,
		name: 'forum',
		url: '/forum',
		...toViewTemplateDefaults('Forum'),
	},
	{
		community_id,
		name: 'notes',
		url: '/notes',
		...toViewTemplateDefaults('Notes'),
	},
	{
		community_id,
		name: 'todo',
		url: '/todo',
		...toViewTemplateDefaults('Todo'),
	},
];

const toViewTemplateDefaults = (name: string): {view: ViewData; icon: string} => {
	const viewTemplate = viewTemplates.find((v) => v.name === name);
	if (!viewTemplate) throw Error(`Unable to find view template with name ${name}`);
	return {view: parseView(viewTemplate.template), icon: viewTemplate.icon};
};
