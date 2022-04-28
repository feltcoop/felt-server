import {viewTemplates} from '$lib/vocab/view/view';
import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Community} from '$lib/vocab/community/community';

export const toDefaultSpaces = (
	persona_id: number,
	{community_id, name}: Community,
): CreateSpaceParams[] => [
	{persona_id, community_id, name, url: '/', ...toViewTemplateDefaults('Home')},
	{persona_id, community_id, name: 'room', url: '/room', ...toViewTemplateDefaults('Room')},
	{persona_id, community_id, name: 'board', url: '/board', ...toViewTemplateDefaults('Board')},
	{persona_id, community_id, name: 'forum', url: '/forum', ...toViewTemplateDefaults('Forum')},
	{persona_id, community_id, name: 'notes', url: '/notes', ...toViewTemplateDefaults('Notes')},
	{persona_id, community_id, name: 'todo', url: '/todo', ...toViewTemplateDefaults('Todo')},
];

const toViewTemplateDefaults = (name: string): {view: string; icon: string} => {
	const viewTemplate = viewTemplates.find((v) => v.name === name);
	if (!viewTemplate) throw Error(`Unable to find view template with name ${name}`);
	return {view: viewTemplate.view, icon: viewTemplate.icon};
};
