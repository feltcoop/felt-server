import {toValidateSchema} from '$lib/util/ajv';
import {PersonaParamsSchema, PersonaSchema} from '$lib/vocab/persona/persona';
import type {Persona, PersonaParams} from '$lib/vocab/persona/persona';

export const validatePersona = toValidateSchema<Persona>(PersonaSchema);

export const validatePersonaParams = toValidateSchema<PersonaParams>(PersonaParamsSchema);
