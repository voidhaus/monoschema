import type { MonoSchema, InferTypeFromMonoSchema } from '@voidhaus/monoschema';
import type {
  InputWrapper,
  OutputWrapper,
  ResolverWrapper,
  NamespaceWrapper,
  Procedure
} from '@voidhaus/rpc-types';

/**
 * Creates an input wrapper for a MonoSchema.
 * This wrapper is used to define the input schema for an RPC procedure.
 */
export function input<T extends MonoSchema>(schema: T): InputWrapper<T> {
  return {
    _inputSchema: schema,
    _tag: 'input',
  };
}

/**
 * Creates an output wrapper for a MonoSchema.
 * This wrapper is used to define the output schema for an RPC procedure.
 */
export function output<T extends MonoSchema>(schema: T): OutputWrapper<T> {
  return {
    _outputSchema: schema,
    _tag: 'output',
  };
}

/**
 * Creates a typed resolver wrapper that can be used with procedure().
 * This allows for better type inference and reusability of resolver functions.
 */
export function resolver<I = unknown, O = unknown>(fn: (input: I) => O | Promise<O>): ResolverWrapper<I, O> {
  return {
    _resolver: fn,
    _tag: 'resolver',
  };
}

/**
 * Creates a namespace wrapper for organizing procedures.
 * Namespaces allow for hierarchical organization of RPC methods.
 */
export function namespace<T extends Record<string, unknown>>(obj: T): NamespaceWrapper<T> {
  return {
    _namespace: obj,
    _tag: 'namespace',
  };
}

/**
 * Creates an RPC procedure with input/output schemas and a resolver.
 * Supports both resolver wrapper and inline function formats.
 */
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
  resolverFn: (input: InferTypeFromMonoSchema<TInput>) => InferTypeFromMonoSchema<TOutput> | Promise<InferTypeFromMonoSchema<TOutput>>
): Procedure<InferTypeFromMonoSchema<TInput>, InferTypeFromMonoSchema<TOutput>>;

export function procedure(
  inputWrapper: InputWrapper<MonoSchema>,
  outputWrapper: OutputWrapper<MonoSchema>,
  resolverWrapper: ResolverWrapper<unknown, unknown> | ((input: unknown) => unknown | Promise<unknown>)
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
