// Schema type definitions for MonoSchema
import type { Constraint } from "./constraints";

// Forward declaration for MonoSchemaInstance
export type MonoSchemaInstance = {
  validate: <T extends MonoSchema>(schema: T) => (value: unknown) => ValidationResult<unknown>;
};

// Schema type definitions
type MonoSchemaType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | ObjectConstructor
  | ArrayConstructor
  | ((...args: unknown[]) => { validate: (value: unknown, monoSchemaInstance?: MonoSchemaInstance) => unknown });

export type MonoSchemaProperty = {
  $type: MonoSchemaType | readonly MonoSchemaType[];
  $optional?: boolean;
  $readonly?: boolean;
  $properties?: Record<string, MonoSchemaProperty>;
  $constraints?: readonly Constraint[];
  // Extensible for plugin fields
  [key: string]: unknown;
};

export type MonoSchema = {
  $type: MonoSchemaType | readonly MonoSchemaType[];
  $optional?: boolean;
  $readonly?: boolean;
  $properties?: Record<string, MonoSchemaProperty>;
  $constraints?: readonly Constraint[];
  // Extensible for plugin fields
  [key: string]: unknown;
};

export type Plugin = {
  name: string;
  description?: string;
  version?: string;
  types: Array<MonoSchemaType>;
  prevalidate?: Array<(
    value: unknown,
    schema: MonoSchemaProperty,
    path: string
  ) => unknown>;
};

export type ConfigureMonoSchemaOptions = {
  plugins?: Plugin[];
  stripUnknownProperties?: boolean;
  errorUnknownProperties?: boolean;
};

export type ValidationError = {
  path: string;
  message: string;
  expected: string;
  received: string;
  value: unknown;
};

export type ValidationResult<T = unknown> = {
  valid: boolean;
  errors: ValidationError[];
  data?: T;
};

export const Any = Object.assign(
  () => {
    return {
      validate: () => true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tsType: null as unknown as any,
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { tsType: null as unknown as any }
);

export const AnyPlugin: Plugin = {
  name: "AnyPlugin",
  description: "A plugin that allows any type of value",
  version: "1.0.0",
  types: [Any],
}
