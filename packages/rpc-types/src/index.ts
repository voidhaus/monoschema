import type { MonoSchema } from '@voidhaus/monoschema';

// JSON-RPC protocol types
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

// Core RPC wrapper types
export interface InputWrapper<T extends MonoSchema> {
  _inputSchema: T;
  _tag: 'input';
}

export interface OutputWrapper<T extends MonoSchema> {
  _outputSchema: T;
  _tag: 'output';
}

export interface ResolverWrapper<I, O> {
  _resolver: (input: I) => O | Promise<O>;
  _tag: 'resolver';
}

export interface NamespaceWrapper<T> {
  _namespace: T;
  _tag: 'namespace';
}

export interface Procedure<I, O> {
  _inputSchema: MonoSchema;
  _outputSchema: MonoSchema;
  _resolver: (input: I) => O | Promise<O>;
  _tag: 'procedure';
}

// RPC App interface
export interface RpcApp<T> {
  _definition: T;
  callProcedure(request: JsonRpcRequest): JsonRpcResponse | Promise<JsonRpcResponse>;
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

// Configuration types
export interface RpcConfig {
  monoschema: {
    validate: <T extends MonoSchema>(schema: T) => (value: unknown) => {
      valid: boolean;
      errors: Array<{
        path: string;
        message: string;
        expected: string;
        received: string;
        value: unknown;
      }>;
    };
  };
}

// Type inference utilities

// Improved: Accepts both RpcApp<T> and NamespaceWrapper<T> directly for better type inference in monorepo usage
export type InferRpcContract<T> =
  T extends RpcApp<infer U> ? InferContractFromNamespace<U> :
  T extends NamespaceWrapper<infer U> ? InferContractFromNamespace<U> :
  never;

type InferContractFromNamespace<T> = T extends NamespaceWrapper<infer U>
  ? InferContractFromNamespace<U>
  : {
      [K in keyof T]: T[K] extends Procedure<infer I, infer O>
        ? {
            input: I;
            output: O;
          }
        : T[K] extends NamespaceWrapper<infer U>
        ? InferContractFromNamespace<U>
        : never;
    };

// Validation result types
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
