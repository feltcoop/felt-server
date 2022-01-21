import type {Gen} from '@feltcoop/gro/dist/gen/gen.js';
import {toRootPath} from '@feltcoop/gro/dist/paths.js';
import {resolve, basename} from 'path';

import {eventInfos} from '$lib/app/events';
import {jsonSchemaToTypescript, toTypeName} from '$lib/util/jsonSchemaToTypescript';
import {schemas} from '$lib/app/schemas';
import {ID_VOCAB_PREFIX} from '$lib/vocab/util';

const toParamsName = (name: string): string => toTypeName(name + 'Params');
const toResponseName = (name: string): string => toTypeName(name + 'Response');
const toResponseResultName = (name: string): string => toTypeName(name + 'ResponseResult');

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
import type {Entity} from '$lib/vocab/entity/entity';
import type {EntityData} from '$lib/vocab/entity/entityData';
import type {ViewData} from '$lib/vocab/view/view';
import type {DispatchContext} from '$lib/app/dispatch';

export interface EventParamsByName {
	${eventInfos.reduce(
		(str, eventInfo) =>
			str +
			`
${eventInfo.name}: ${toParamsName(eventInfo.name)};
`.trim(),
		'',
	)}
}
export interface EventResponseByName {
	${eventInfos.reduce(
		(str, eventInfo) =>
			str +
			(eventInfo.type === 'ClientEvent'
				? ''
				: `
${eventInfo.name}: ${toResponseName(eventInfo.name)};
`.trim()),
		'',
	)}
}

${await eventInfos.reduce(
	async (str, eventInfo) =>
		(await str) +
		`
${await jsonSchemaToTypescript(eventInfo.params, toParamsName(eventInfo.name))}${
			'response' in eventInfo
				? await jsonSchemaToTypescript(eventInfo.response, toResponseName(eventInfo.name), {
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
		}${
			// TODO hacky, the ApiResult type should be represented in the schema
			// but that requires generic type generation:
			// https://github.com/bcherny/json-schema-to-typescript/issues/59
			'response' in eventInfo
				? `	export type ${toResponseResultName(eventInfo.name)} = ApiResult<${toResponseName(
						eventInfo.name,
				  )}>;`
				: ''
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
			params: ${toParamsName(eventInfo.name)},
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
        ctx: DispatchContext<${toParamsName(eventInfo.name)}, ${
				eventInfo.type === 'ClientEvent' ? 'void' : toResponseResultName(eventInfo.name)
			}>,
      ) => ${eventInfo.returns};
`.trim(),
		'',
	)}
}

// generated by ${toRootPath(originId)}
`.trim();
};
