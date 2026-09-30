import { syntheticCases } from "./synthetic-cases.ts";
export const expectedResults = Object.fromEntries(syntheticCases.map(({ id, expected }) => [id, expected]));
