// Deliberate architectural violation for testing arch:check
// Deep import into module internals (schema.ts instead of public index.ts) from outside
import { skills } from "../../../src/modules/catalog/schema";

export const dummy = skills;
