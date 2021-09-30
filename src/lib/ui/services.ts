import * as servicesMeta from '$lib/server/servicesMeta';
import type {ServiceMeta} from '$lib/server/servicesMeta';

// `$lib/server/services.ts` imports the server's vocab services,
// and this client-friendly module instead only imports the services metadata.

export const lookupService = (name: string): ServiceMeta | undefined => (servicesMeta as any)[name];
