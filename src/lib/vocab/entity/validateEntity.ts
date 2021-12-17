import {toValidateSchema} from '$lib/util/ajv';
import {EntitySchema} from '$lib/vocab/entity/entity';
import type {Entity} from '$lib/vocab/entity/entity';

export const validateEntity = toValidateSchema<Entity>(EntitySchema);
