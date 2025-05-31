// Schema type definitions for MonoSchema
import type { Constraint } from "./constraints";

// Schema type definitions
type MonoSchemaType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | ObjectConstructor
  | ArrayConstructor
  | ((...args: unknown[]) => { validate: (value: unknown) => unknown });

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
