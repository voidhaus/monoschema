import { InferTypeFromMonoSchema, type MonoSchema } from '@voidhaus/monoschema';

// JSON-RPC types
export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: unknown;
  id: number | string | null;
}

export interface JsonRpcResponse {
  jsonrpc: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  } | null;
  id: number | string | null;
}

// Schema wrapper types
export interface InputWrapper<T extends MonoSchema> {
  _inputSchema: T;
  _tag: 'input';
}

export interface OutputWrapper<T extends MonoSchema> {
  _outputSchema: T;
  _tag: 'output';
}

export interface ResolverWrapper<I, O> {
  _resolver: (input: I) => O;
  _tag: 'resolver';
}

// Namespace type
export interface NamespaceWrapper<T> {
  _namespace: T;
  _tag: 'namespace';
}

// Procedure type
export interface Procedure<I, O> {
  _inputSchema: MonoSchema;
  _outputSchema: MonoSchema;
  _resolver: (input: I) => O;
  _tag: 'procedure';
}

// Schema builder functions
export function input<T extends MonoSchema>(schema: T): InputWrapper<T> {
  return {
    _inputSchema: schema,
    _tag: 'input',
  };
}

export function output<T extends MonoSchema>(schema: T): OutputWrapper<T> {
  return {
    _outputSchema: schema,
    _tag: 'output',
  };
}

// Resolver function - this creates a typed resolver that can be used with procedure()
export function resolver<I = unknown, O = unknown>(fn: (input: I) => O): ResolverWrapper<I, O> {
  return {
    _resolver: fn,
    _tag: 'resolver',
  };
}

// Namespace function
export function namespace<T extends Record<string, unknown>>(obj: T): NamespaceWrapper<T> {
  return {
    _namespace: obj,
    _tag: 'namespace',
  };
}

// Procedure builder function with overloads for both resolver wrapper and inline functions
export function procedure<
  TInput extends MonoSchema,
  TOutput extends MonoSchema
>(
  inputWrapper: InputWrapper<TInput>,
  outputWrapper: OutputWrapper<TOutput>,
  resolverWrapper: ResolverWrapper<InferTypeFromMonoSchema<TInput>, InferTypeFromMonoSchema<TOutput>>
): Procedure<InferTypeFromMonoSchema<TInput>, InferTypeFromMonoSchema<TOutput>>;

export function procedure<
  TInput extends MonoSchema,
  TOutput extends MonoSchema
>(
  inputWrapper: InputWrapper<TInput>,
  outputWrapper: OutputWrapper<TOutput>,
  resolverFn: (input: InferTypeFromMonoSchema<TInput>) => InferTypeFromMonoSchema<TOutput>
): Procedure<InferTypeFromMonoSchema<TInput>, InferTypeFromMonoSchema<TOutput>>;

export function procedure(
  inputWrapper: InputWrapper<MonoSchema>,
  outputWrapper: OutputWrapper<MonoSchema>,
  resolverWrapper: ResolverWrapper<unknown, unknown> | ((input: unknown) => unknown)
): Procedure<unknown, unknown> {
  const resolverFn = typeof resolverWrapper === 'function' 
    ? resolverWrapper 
    : resolverWrapper._resolver;
    
  return {
    _inputSchema: inputWrapper._inputSchema,
    _outputSchema: outputWrapper._outputSchema,
    _resolver: resolverFn,
    _tag: 'procedure',
  };
}

// Type to infer the contract from a router definition
export type InferRpcContract<T> = T extends RpcApp<infer U> ? InferContractFromNamespace<U> : never;

type InferContractFromNamespace<T> = {
  [K in keyof T]: T[K] extends Procedure<infer I, infer O>
    ? {
        input: I;
        output: O;
      }
    : T[K] extends NamespaceWrapper<infer U>
    ? InferContractFromNamespace<U>
    : never;
};

// RPC App interface
export interface RpcApp<T> {
  _definition: T;
  callProcedure(request: JsonRpcRequest): JsonRpcResponse;
}

// Router function type with overloads for type checking and inference
export interface RpcRouter {
  // Overload for when expected type is provided - validates definition matches expected structure
  <TExpected extends RpcApp<unknown>>(
    definition: TExpected extends RpcApp<infer TDef> ? TDef : never
  ): TExpected;
  
  // Overload for type inference when no generic is provided
  <T extends Record<string, Procedure<unknown, unknown> | NamespaceWrapper<unknown>> | NamespaceWrapper<unknown>>(
    definition: T
  ): RpcApp<T>;
}

// Main createRpc function
export function createRpc(config: { monoschema: { validate: <T extends MonoSchema>(schema: T) => (value: unknown) => { valid: boolean; errors: Array<{ path: string; message: string; expected: string; received: string; value: unknown }> } } }): RpcRouter {
  const { monoschema } = config;
  return function <T extends Record<string, Procedure<unknown, unknown> | NamespaceWrapper<unknown>> | NamespaceWrapper<unknown>>(
    definition: T
  ): RpcApp<T> {
    
    // Helper function to find a procedure by method path
    function findProcedure(obj: unknown, methodPath: string[]): Procedure<unknown, unknown> | null {
      if (methodPath.length === 0) return null;
      
      const [currentPath, ...remainingPath] = methodPath;
      if (!currentPath) return null;
      
      // Handle case where obj is a namespace wrapper
      if (typeof obj === 'object' && obj !== null && '_tag' in obj && (obj as { _tag: string })._tag === 'namespace') {
        obj = (obj as NamespaceWrapper<Record<string, unknown>>)._namespace;
      }
      
      if (typeof obj !== 'object' || obj === null) return null;
      
      const current = (obj as Record<string, unknown>)[currentPath];
      
      if (!current) return null;
      
      if (remainingPath.length === 0) {
        // This should be a procedure
        if (typeof current === 'object' && current !== null && '_tag' in current && (current as { _tag: string })._tag === 'procedure') {
          return current as Procedure<unknown, unknown>;
        }
        return null;
      }
      
      // This should be a namespace
      if (typeof current === 'object' && current !== null && '_tag' in current && (current as { _tag: string })._tag === 'namespace') {
        return findProcedure((current as NamespaceWrapper<Record<string, unknown>>)._namespace, remainingPath);
      }
      
      return null;
    }
    
    // Helper function to validate input against schema using MonoSchema
    function validateInput(input: unknown, schema: MonoSchema): { valid: boolean; error?: string } {
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
    
    return {
      _definition: definition,
      callProcedure(request: JsonRpcRequest): JsonRpcResponse {
        try {
          // Handle string requests (invalid JSON) - cast to allow string for testing
          const actualRequest = request as JsonRpcRequest | string;
          if (typeof actualRequest === 'string') {
            return {
              jsonrpc: '2.0',
              error: {
                code: -32700,
                message: 'Parse error: Invalid JSON format',
              },
              id: null,
            };
          }

          // At this point, request is guaranteed to be JsonRpcRequest
          const jsonRpcRequest = actualRequest as JsonRpcRequest;

          // Validate JSON-RPC format
          if (!jsonRpcRequest.method || jsonRpcRequest.params === undefined) {
            return {
              jsonrpc: '2.0',
              error: {
                code: -32600,
                message: 'Invalid Request: Missing method or params',
              },
              id: jsonRpcRequest.id,
            };
          }
          
          // Find the procedure
          const methodPath = jsonRpcRequest.method.split('.');
          const procedure = findProcedure(definition, methodPath);
          
          if (!procedure) {
            return {
              jsonrpc: '2.0',
              error: {
                code: -32601,
                message: `Method not found: ${jsonRpcRequest.method}`,
              },
              id: jsonRpcRequest.id,
            };
          }
          
          // Validate input parameters
          const validation = validateInput(jsonRpcRequest.params, procedure._inputSchema);
          if (!validation.valid) {
            return {
              jsonrpc: '2.0',
              error: {
                code: -32602,
                message: validation.error!,
              },
              id: jsonRpcRequest.id,
            };
          }
          
          // Execute the resolver
          try {
            const result = procedure._resolver(jsonRpcRequest.params);
            return {
              jsonrpc: '2.0',
              result,
              error: null,
              id: jsonRpcRequest.id,
            };
          } catch (error) {
            return {
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: error instanceof Error ? `Internal error: ${error.message}` : 'Internal error',
              },
              id: jsonRpcRequest.id,
            };
          }
        } catch {
          const actualRequest = request as JsonRpcRequest | string;
          return {
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal error',
            },
            id: typeof actualRequest === 'string' ? null : actualRequest.id,
          };
        }
      },
    };
  };
}