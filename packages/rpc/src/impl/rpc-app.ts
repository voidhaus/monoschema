import type { JsonRpcRequest, JsonRpcResponse, RpcApp, RpcConfig } from '@voidhaus/rpc-types';
import { validateInput } from './validation';
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
    callProcedure(request: JsonRpcRequest): JsonRpcResponse {
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
        const execution = executeProcedure(procedure, jsonRpcRequest.params);
        
        if (!execution.success) {
          return createErrorResponse(
            -32603,
            execution.error,
            jsonRpcRequest.id
          );
        }
        
        return createSuccessResponse(execution.result, jsonRpcRequest.id);
        
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
