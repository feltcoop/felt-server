import type {Gen} from '@feltcoop/gro/dist/gen/gen.js';
import {toRootPath} from '@feltcoop/gro/dist/paths.js';

import {events} from '$lib/ui/eventData.events';

// Outputs a file with services metadata that can be imported from the client.
export const gen: Gen = async ({originId}) => {
	// TODO we're not currently including the schemas since we don't yet use them on the client
	// import type {AnySchema} from 'ajv';
	// paramsSchema: AnySchema;
	// responseSchema: AnySchema;
	// paramsSchema: ${JSON.stringify(service.paramsSchema)},
	// responseSchema: ${JSON.stringify(service.responseSchema)},
	return `
// generated by ${toRootPath(originId)}
  
import type {Readable} from 'svelte/store';
import type {Static} from '@sinclair/typebox';

import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiResult} from '$lib/server/api';
import type {Community} from '$lib/vocab/community/community';
import type {Persona} from '$lib/vocab/persona/persona';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Space} from '$lib/vocab/space/space';
import type {File} from '$lib/vocab/file/file';
import type {DispatchContext} from '$lib/ui/api';
import type {LoginRequest} from '$lib/session/loginMiddleware.js';
import type {MainNavView} from './ui';

export interface Dispatch {
${events.reduce(
	(str, eventData) =>
		str +
		`
  (
    eventName: '${eventData.name}',
    params: ${eventData.params.type},
  ): ${eventData.returns};`,
	'',
)}
}

export interface UiHandlers {
  ${events.reduce(
		(str, eventData) =>
			str +
			`
      ${eventData.name}: (
        ctx: DispatchContext<${eventData.params.type}, ${eventData.response.type}>,
      ) => ${eventData.returns};`,
		'',
	)}
  };

// generated by ${toRootPath(originId)}
  `.trim();
};
