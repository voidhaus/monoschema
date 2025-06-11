// Main module for MonoSchema - re-exports from modular files

// Re-export type inference
export type { InferTypeFromMonoSchema } from "./type-inference";

// Re-export core types
export type {
  MonoSchema,
  MonoSchemaProperty,
  Plugin,
  ConfigureMonoSchemaOptions,
  ValidationError,
  ValidationResult,
  MonoSchemaInstance,
  // NEW: Conditional validation types
  ConditionalRule,
  ConditionalCondition,
  ConditionalAction,
  DiscriminantConfig
} from "./types";
export { Any } from "./types";

// Re-export property path utilities
export type {
  InferredPropertyPath,
  ValueAtPath,
  MonogSchemaPropertPath
} from "./property-paths";

// Re-export main configuration function
export { configureMonoSchema } from "./configure";
