/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { InferredPropertyPath, ValueAtPath } from '@voidhaus/monoschema';
// --- Type helpers ---
// Use the property path types from monoschema
type PropertyPath<T> = InferredPropertyPath<T>;

// --- Update Operator Types ---
type UpdateOp<T> = { toMongo(): any };

// --- Operator Implementations ---

// Allow null for set values (for MongoDB semantics)
function set<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P> | null): UpdateOp<T> {
  return {
    toMongo() {
      return { $set: { [field]: value } };
    },
    __field: field,
    __op: '$set',
    __value: value,
  } as any;
}

function inc<T, P extends PropertyPath<T>>(field: P, value: number): UpdateOp<T> {
  return {
    toMongo() {
      return { $inc: { [field]: value } };
    },
    __field: field,
    __op: '$inc',
    __value: value,
  } as any;
}

// --- Main Update Builder ---
function update<T>(...ops: UpdateOp<T>[]): UpdateOp<T> {
  return {
    toMongo() {
      // Merge all ops into a single Mongo update object
      const result: Record<string, Record<string, any>> = {};
      for (const op of ops) {
        const mongo = op.toMongo();
        for (const opKey in mongo) {
          if (!result[opKey]) result[opKey] = {};
          Object.assign(result[opKey], mongo[opKey]);
        }
      }
      return result;
    },
    __ops: ops,
  } as any;
}

// --- Exports ---
export {
  update,
  set,
  inc,
};
