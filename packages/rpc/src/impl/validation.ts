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
