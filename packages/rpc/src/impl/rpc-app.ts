import type { JsonRpcRequest, JsonRpcResponse, RpcApp, RpcConfig, RpcContext } from '@voidhaus/rpc-types';
import type { MonoSchema } from '@voidhaus/monoschema';
import { validateInput, validateOutput } from './validation';
import { findProcedure, executeProcedure } from './procedure-resolver';

/**
 * Creates an RPC application that can handle JSON-RPC requests.
 * The app encapsulates a procedure definition and provides a standardized
 * interface for processing JSON-RPC calls.
 */
export function createRpcApp<T>(
  definition: T,
  config: RpcConfig
): RpcApp<T> {
  return {
    _definition: definition,
    _config: config,
    callProcedure(request: JsonRpcRequest, context: RpcContext): JsonRpcResponse | Promise<JsonRpcResponse> {
      try {
        // Handle string requests (invalid JSON) - cast to allow string for testing
        const actualRequest = request as JsonRpcRequest | string;
        if (typeof actualRequest === 'string') {
          return createErrorResponse(-32700, 'Parse error: Invalid JSON format', null);
        }

        // At this point, request is guaranteed to be JsonRpcRequest
        const jsonRpcRequest = actualRequest as JsonRpcRequest;

        // Validate JSON-RPC format
        if (!jsonRpcRequest.method || jsonRpcRequest.params === undefined) {
          return createErrorResponse(
            -32600,
            'Invalid Request: Missing method or params',
            jsonRpcRequest.id
          );
        }
        
        // Find the procedure
        const methodPath = jsonRpcRequest.method.split('.');
        const procedure = findProcedure(definition, methodPath);
        
        if (!procedure) {
          return createErrorResponse(
            -32601,
            `Method not found: ${jsonRpcRequest.method}`,
            jsonRpcRequest.id
          );
        }
        
        // Validate input parameters
        const validation = validateInput(
          jsonRpcRequest.params,
          procedure._inputSchema,
          config.monoschema
        );
        
        if (!validation.valid) {
          return createErrorResponse(
            -32602,
            validation.error || 'Invalid params',
            jsonRpcRequest.id
          );
        }
        
        // Execute the resolver
        const execution = executeProcedure(procedure, jsonRpcRequest.params, context);
        
        // Check if execution returns a Promise
        if (execution instanceof Promise) {
          return execution.then((result) => {
            if (!result.success) {
              return createErrorResponse(
                -32603,
                result.error,
                jsonRpcRequest.id
              );
            }
            
            // Apply output validation if enabled
            const finalResult = applyOutputValidation(
              result.result, 
              procedure._outputSchema, 
              config
            );
            
            if (!finalResult.valid) {
              return createErrorResponse(
                -32603,
                finalResult.error || 'Output validation failed',
                jsonRpcRequest.id
              );
            }
            
            return createSuccessResponse(finalResult.data, jsonRpcRequest.id);
          });
        }
        
        // Handle synchronous execution
        if (!execution.success) {
          return createErrorResponse(
            -32603,
            execution.error,
            jsonRpcRequest.id
          );
        }
        
        // Apply output validation if enabled
        const finalResult = applyOutputValidation(
          execution.result, 
          procedure._outputSchema, 
          config
        );
        
        if (!finalResult.valid) {
          return createErrorResponse(
            -32603,
            finalResult.error || 'Output validation failed',
            jsonRpcRequest.id
          );
        }
        
        return createSuccessResponse(finalResult.data, jsonRpcRequest.id);
        
      } catch {
        const actualRequest = request as JsonRpcRequest | string;
        return createErrorResponse(
          -32603,
          'Internal error',
          typeof actualRequest === 'string' ? null : actualRequest.id
        );
      }
    },
  };
}

/**
 * Creates a standardized JSON-RPC success response.
 */
function createSuccessResponse(result: unknown, id: number | string | null): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    result,
    error: null,
    id,
  };
}

/**
 * Creates a standardized JSON-RPC error response.
 */
function createErrorResponse(
  code: number,
  message: string,
  id: number | string | null
): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    error: {
      code,
      message,
    },
    id,
  };
}

/**
 * Applies output validation if enabled in the configuration.
 * Returns the original result if validation is disabled or the validated/transformed result if enabled.
 */
function applyOutputValidation(
  result: unknown,
  outputSchema: unknown,
  config: RpcConfig
): { valid: boolean; data: unknown; error?: string } {
  // If output validation is not enabled, just return the original result
  if (!config.validateOutput) {
    return { valid: true, data: result };
  }
  
  // Apply output validation using the schema
  const validationResult = validateOutput(result, outputSchema as MonoSchema, config.monoschema);
  
  // If validation failed and error masking is enabled, return a generic error
  if (!validationResult.valid && config.maskOutputValidationErrors) {
    return { 
      valid: false, 
      data: validationResult.data, 
      error: 'Internal server error' 
    };
  }
  
  return validationResult;
}
