import * as servicesMeta from '$lib/server/servicesMeta';
import type {ServiceMeta} from '$lib/server/servicesMeta';

// This is a client-friendly module that exposes the services metadata,
// not their server-side implementation.

export const findService = (name: string): ServiceMeta | undefined => (servicesMeta as any)[name];
