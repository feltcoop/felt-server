import {toValidateSchema} from '$lib/util/ajv';
import {PersonaParamsSchema, PersonaSchema} from './persona';
import type {Persona, PersonaParams} from './persona';

export const validatePersona = toValidateSchema<Persona>(PersonaSchema);

export const validatePersonaParams = toValidateSchema<PersonaParams>(PersonaParamsSchema);
