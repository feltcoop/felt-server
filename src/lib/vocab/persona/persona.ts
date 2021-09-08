import {Type, Static} from '@sinclair/typebox';

export interface Persona {
	persona_id: number;
	account_id: number;
	name: string;
	community_ids: number[];
}

export type PersonaParams = Static<typeof PersonaParamsSchema>;
export const PersonaParamsSchema = Type.Object({
	account_id: Type.Number(),
	name: Type.String(),
});

//TODO
//2.5: Render active persona
