// Main configuration function for MonoSchema
import type { InferTypeFromMonoSchema } from "./type-inference";
import type { MonoSchema, MonoSchemaProperty, ConfigureMonoSchemaOptions, ValidationResult, MonoSchemaInstance } from "./types";
import { validateValue, runPrevalidation } from "./validation";
import { getTypeName, getValueAtPropertyPath, getSchemaAtPropertyPath, getValueTypeName } from "./validation-utils";

// Main configuration function
export function configureMonoSchema(options: ConfigureMonoSchemaOptions = {}) {
  const plugins = options.plugins || [];
  
  const monoSchemaInstance: MonoSchemaInstance = {
    validate: <T extends MonoSchema>(schema: T) => 
      (value: unknown): ValidationResult<unknown> => {
        try {
          const prevalidated = runPrevalidation(schema, value, "", plugins, monoSchemaInstance);
          const errors = validateValue(schema, prevalidated, "", plugins, monoSchemaInstance);
          return {
            valid: errors.length === 0,
            errors,
            data: errors.length === 0 ? prevalidated : undefined,
          };
        } catch (error) {
          if (error instanceof Error) {
            // Parse transformation errors
            const match = error.message.match(/^(.+?): (.+)$/);
            if (match) {
              const [, path, message] = match;
              // Extract the field value from the original input
              const fieldValue = getValueAtPropertyPath(value, path || '');
              // Try to get the property schema at the error path
              const propertySchema = getSchemaAtPropertyPath(schema, path || '');
              return {
                valid: false,
                errors: [{
                  path: path || '',
                  message: message || error.message,
                  expected: getTypeName((propertySchema as MonoSchemaProperty)?.$type ?? schema.$type),
                  received: getValueTypeName(fieldValue),
                  value: fieldValue,
                }],
                data: undefined,
              };
            }
          }
          throw error;
        }
      },
  };
  
  return {
    validate: <T extends MonoSchema>(schema: T) => 
      (value: unknown): ValidationResult<InferTypeFromMonoSchema<T>> => {
        try {
          const prevalidated = runPrevalidation(schema, value, "", plugins, monoSchemaInstance);
          const errors = validateValue(schema, prevalidated, "", plugins, monoSchemaInstance);
          return {
            valid: errors.length === 0,
            errors,
            data: errors.length === 0 ? (prevalidated as InferTypeFromMonoSchema<T>) : undefined,
          };
        } catch (error) {
          if (error instanceof Error) {
            // Parse transformation errors
            const match = error.message.match(/^(.+?): (.+)$/);
            if (match) {
              const [, path, message] = match;
              // Extract the field value from the original input
              const fieldValue = getValueAtPropertyPath(value, path || '');
              // Try to get the property schema at the error path
              const propertySchema = getSchemaAtPropertyPath(schema, path || '');
              return {
                valid: false,
                errors: [{
                  path: path || '',
                  message: message || error.message,
                  expected: getTypeName((propertySchema as MonoSchemaProperty)?.$type ?? schema.$type),
                  received: getValueTypeName(fieldValue),
                  value: fieldValue,
                }],
                data: undefined,
              };
            }
          }
          throw error;
        }
      },
  };
}
