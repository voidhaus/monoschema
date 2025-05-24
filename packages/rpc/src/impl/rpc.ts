// Namespace utility
export function namespace(obj: Record<string, any>) {
  return {
    __isNamespace: true as const,
    value: obj,
  };
}

// Implementation for procedure and createRpc
import { configureMonoSchema } from '@voidhaus/monoschema';

// Helper type to infer input/output types from monoschema schemas
type MonoType<T> = T extends StringConstructor
  ? string
  : T extends NumberConstructor
  ? number
  : T extends BooleanConstructor
  ? boolean
  : unknown;

export type InferSchema<T> = T extends { [K: string]: { $type: infer U } }
  ? { [K in keyof T]: MonoType<T[K]["$type"]> }
  : never;

// Strongly-typed procedure builder
export function procedure() {
  return new ProcedureBuilder();
}

class ProcedureBuilder<I = unknown, O = unknown> {
  _inputSchema: any;
  _outputSchema: any;

  input<TSchema extends Record<string, { $type: any }>>(schema: TSchema): ProcedureBuilder<InferSchema<TSchema>, O> {
    const next = new ProcedureBuilder<InferSchema<TSchema>, O>();
    next._inputSchema = schema;
    next._outputSchema = this._outputSchema;
    return next;
  }

  output<TSchema extends Record<string, { $type: any }>>(schema: TSchema): ProcedureBuilder<I, InferSchema<TSchema>> {
    const next = new ProcedureBuilder<I, InferSchema<TSchema>>();
    next._inputSchema = this._inputSchema;
    next._outputSchema = schema;
    return next;
  }

  resolve(fn: (input: I) => O) {
    return {
      inputSchema: this._inputSchema,
      outputSchema: this._outputSchema,
      resolver: fn,
      _isProcedure: true as const,
    };
  }
}

// createRpc implementation
export function createRpc(config: { monoschema: ReturnType<typeof configureMonoSchema> }) {
  // Helper to recursively find a procedure by path (dot notation)
  function findProcedure(obj: any, path: string[]): any {
    if (!obj || path.length === 0) return undefined;
    if (path.length === 0) return undefined;
    const [head, ...rest] = path;
    if (typeof obj !== 'object' || obj === null) return undefined;
    if (typeof head !== 'string' || !(head in obj)) return undefined;
    const next: any = (obj as Record<string, any>)[head];
    // If this is a namespace, unwrap its value
    if (typeof next === 'object' && next !== null && next.__isNamespace && next.value) {
      return findProcedure(next.value, rest);
    }
    if (rest.length === 0) return next;
    return findProcedure(next, rest);
  }

  return function(routerDef: Record<string, any>) {
    return {
      ...routerDef,
      callProcedure: (jsonRpc: {
        jsonrpc: string;
        method: string;
        params: any;
        id: number | string;
      }) => {
        const methodPath = jsonRpc.method.split('.');
        const proc = findProcedure(routerDef, methodPath);
        if (!proc || typeof proc.resolver !== 'function') {
          return {
            jsonrpc: jsonRpc.jsonrpc,
            error: {
              code: -32601,
              message: 'Method not found',
            },
            id: jsonRpc.id,
          };
        }
        // Optionally, validate input here using proc.inputSchema and config.monoschema
        const result = proc.resolver(jsonRpc.params);
        return {
          jsonrpc: jsonRpc.jsonrpc,
          result,
          id: jsonRpc.id,
        };
      },
    };
  };
}
