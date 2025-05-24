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
  private _inputSchema: any;
  private _outputSchema: any;

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
  return function(routerDef: Record<string, { inputSchema: any; outputSchema: any; resolver: (input: any) => any; _isProcedure: true }>) {
    // You can extend this to actually register procedures, validate schemas, etc.
    return routerDef;
  };
}
