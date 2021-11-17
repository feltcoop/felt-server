import type {Gen} from '@feltcoop/gro/dist/gen/gen.js';
import {toRootPath} from '@feltcoop/gro/dist/paths.js';
import {resolve, basename} from 'path';

import {eventInfos} from '$lib/app/events';
import {jsonSchemaToTypescript, toTypeName} from '$lib/util/jsonSchemaToTypescript';
import {schemas} from '$lib/app/schemas';
import {ID_VOCAB_PREFIX} from '$lib/vocab/util';

const toParamsTypeName = (name: string): string => toTypeName(name + 'ParamsType');
const toResponseTypeName = (name: string): string => toTypeName(name + 'ResponseType');

// Outputs a file with event types that can be imported from anywhere with no runtime cost.
export const gen: Gen = async ({originId}) => {
	const schemaDir = resolve('src/lib/vocab');
	const schemaMatcher = new RegExp(`^${schemaDir}/\\w+\\.json$`);

	return `
// generated by ${toRootPath(originId)}
  
import type {Readable} from 'svelte/store';

import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiResult} from '$lib/server/api';
import type {Community} from '$lib/vocab/community/community';
import type {Persona} from '$lib/vocab/persona/persona';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Space} from '$lib/vocab/space/space';
import type {File} from '$lib/vocab/file/file';
import type {DispatchContext} from '$lib/ui/api';

export interface EventsParams {
	${eventInfos.reduce(
		(str, eventInfo) =>
			str +
			`
${eventInfo.name}: ${toParamsTypeName(eventInfo.name)};
`.trim(),
		'',
	)}
}
export interface EventsResponse {
	${eventInfos.reduce(
		(str, eventInfo) =>
			str +
			(eventInfo.type === 'ClientEvent'
				? ''
				: `
${eventInfo.name}: ${eventInfo.name}_response_type;
`.trim()),
		'',
	)}
}

${await eventInfos.reduce(
	async (str, eventInfo) =>
		(await str) +
		`
${await jsonSchemaToTypescript(eventInfo.params.schema, toParamsTypeName(eventInfo.name))}
${
	'response' in eventInfo
		? await jsonSchemaToTypescript(eventInfo.response.schema, toParamsTypeName(eventInfo.name), {
				cwd: schemaDir,
				$refOptions: {
					resolve: {
						file: {
							canRead: schemaMatcher,
							read: (file) => {
								const schemaTitle = ID_VOCAB_PREFIX + basename(file.url);
								const schema = schemas.find((s) => s.$id === schemaTitle);
								return JSON.stringify(schema);
							},
						},
					},
				},
		  })
		: ''
}
${
	eventInfo.type === 'ClientEvent'
		? ''
		: `export type ${eventInfo.name}_response_type = ${eventInfo.response.type};`
}
`,
	Promise.resolve(''),
)}

export interface Dispatch {
	${eventInfos.reduce(
		(str, eventInfo) =>
			str +
			`
		(
			eventName: '${eventInfo.name}',
			params: ${toParamsTypeName(eventInfo.name)},
		): ${eventInfo.returns};
`.trim(),
		'',
	)}
}

export interface UiHandlers {
  ${eventInfos.reduce(
		(str, eventInfo) =>
			str +
			`
      ${eventInfo.name}: (
        ctx: DispatchContext<${toParamsTypeName(eventInfo.name)}, ${
				eventInfo.type === 'ClientEvent' ? 'void' : eventInfo.response.type
			}>,
      ) => ${eventInfo.returns};
`.trim(),
		'',
	)}
}

// generated by ${toRootPath(originId)}
`.trim();
};
