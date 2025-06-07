import type { MonoSchema } from '@voidhaus/monoschema';
import type { RpcConfig, ValidationResult } from '@voidhaus/rpc-types';

/**
 * Validates input parameters against a MonoSchema using the provided monoschema validator.
 * Formats error messages to match the expected JSON-RPC error format.
 */
export function validateInput(
  input: unknown,
  schema: MonoSchema,
  monoschema: RpcConfig['monoschema']
): ValidationResult {
  const validate = monoschema.validate(schema);
  const result = validate(input);
  
  if (!result.valid && result.errors.length > 0) {
    // Format error message to match expected test format
    const firstError = result.errors[0];
    if (firstError) {
      const fieldName = firstError.path || 'unknown';
      if (firstError.message.includes('Missing required property')) {
        return { valid: false, error: `Invalid params(${fieldName}): Missing required property` };
      } else if (firstError.message.includes('Expected type')) {
        return { valid: false, error: `Invalid params(${fieldName}): ${firstError.message}` };
      } else {
        return { valid: false, error: `Invalid params(${fieldName}): ${firstError.message}` };
      }
    }
    return { valid: false, error: 'Invalid params: Validation failed' };
  }
  
  return { valid: true };
}

/**
 * Validates output against a MonoSchema using the provided monoschema validator.
 * If validation is enabled, it ensures the output conforms to the schema and
 * can strip unknown properties based on monoschema configuration.
 */
export function validateOutput(
  output: unknown,
  schema: MonoSchema,
  monoschema: RpcConfig['monoschema']
): { valid: boolean; data: unknown; error?: string } {
  const validate = monoschema.validate(schema);
  const result = validate(output);
  
  if (!result.valid && result.errors.length > 0) {
    // Format error message for output validation
    const firstError = result.errors[0];
    if (firstError) {
      const fieldName = firstError.path || 'unknown';
      return { 
        valid: false, 
        data: output,
        error: `Output validation failed(${fieldName}): ${firstError.message}` 
      };
    }
    return { 
      valid: false, 
      data: output,
      error: 'Output validation failed: Validation error' 
    };
  }
  
  // Return the validated/transformed data (which may have unknown properties stripped)
  return { valid: true, data: result.data || output };
}
