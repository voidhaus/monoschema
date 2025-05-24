import type { InferTypeFromMonoSchema, MonoSchemaPropertyPath } from '@voidhaus/monoschema';

// --- Type helpers ---
type PropertyPath<T> = MonoSchemaPropertyPath<T>;
type ValueAtPath<T, P extends string> =
  P extends keyof T ? T[P] :
  P extends `${infer K}.${infer Rest}` ?
    K extends keyof T ? ValueAtPath<T[K], Rest> : never
  : never;

// --- Query Operator Types ---
type QueryOp<T> = { toMongo(): any };

// --- Operator Implementations ---
function eq<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $eq: value } };
    },
    __field: field,
    __op: '$eq',
    __value: value,
  } as any;
}

function equals<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> { return eq(field, value); }

function ne<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $ne: value } };
    },
    __field: field,
    __op: '$ne',
    __value: value,
  } as any;
}
function notEquals<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> { return ne(field, value); }

function inArray<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>[]): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $in: value } };
    },
    __field: field,
    __op: '$in',
    __value: value,
  } as any;
}
function in_<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>[]): QueryOp<T> { return inArray(field, value); }
// workaround for reserved word
const inOp = in_;
const inFn = in_;
const inArr = inArray;
// alias for test compatibility
const inAlias = inArray;
// for test: allow `in` as a function name
export { in_ as in };

function notInArray<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>[]): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $nin: value } };
    },
    __field: field,
    __op: '$nin',
    __value: value,
  } as any;
}
function nin<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>[]): QueryOp<T> { return notInArray(field, value); }

function gt<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $gt: value } };
    },
    __field: field,
    __op: '$gt',
    __value: value,
  } as any;
}
function greaterThan<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> { return gt(field, value); }

function gte<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $gte: value } };
    },
    __field: field,
    __op: '$gte',
    __value: value,
  } as any;
}
function greaterThanOrEqual<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> { return gte(field, value); }

function lt<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $lt: value } };
    },
    __field: field,
    __op: '$lt',
    __value: value,
  } as any;
}
function lessThan<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> { return lt(field, value); }

function lte<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $lte: value } };
    },
    __field: field,
    __op: '$lte',
    __value: value,
  } as any;
}
function lessThanOrEqual<T, P extends PropertyPath<T>>(field: P, value: ValueAtPath<T, P>): QueryOp<T> { return lte(field, value); }

function exists<T, P extends PropertyPath<T>>(field: P): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $exists: true } };
    },
    __field: field,
    __op: '$exists',
    __value: true,
  } as any;
}
function fieldExists<T, P extends PropertyPath<T>>(field: P): QueryOp<T> { return exists(field); }

function notExists<T, P extends PropertyPath<T>>(field: P): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $exists: false } };
    },
    __field: field,
    __op: '$exists',
    __value: false,
  } as any;
}
function fieldNotExists<T, P extends PropertyPath<T>>(field: P): QueryOp<T> { return notExists(field); }

function regex<T, P extends PropertyPath<T>>(field: P, pattern: string, options?: string): QueryOp<T> {
  // Always return both $regex and $options if options is provided, so that multiple regex() calls merge
  return {
    toMongo() {
      const out: any = { $regex: pattern };
      if (options) out.$options = options;
      return { [field]: out };
    },
    __field: field,
    __op: '$regex',
    __value: pattern,
    __options: options,
  } as any;
}
function matchesRegex<T, P extends PropertyPath<T>>(field: P, pattern: string, options?: string): QueryOp<T> { return regex(field, pattern, options); }

// --- Logical Operators ---

function and<T>(...conds: QueryOp<T>[]): QueryOp<T> {
  return {
    toMongo() {
      // Merge conditions on the same field within this $and block
      const fieldOps: Record<string, any[]> = {};
      const logicalOps: any[] = [];
      
      for (const cond of conds) {
        const mongo = cond.toMongo();
        // Check if this is a logical operator
        if ('$and' in mongo || '$or' in mongo || '$nor' in mongo || '$text' in mongo) {
          logicalOps.push(mongo);
        } else {
          // Field-level condition
          for (const field in mongo) {
            if (!fieldOps[field]) fieldOps[field] = [];
            fieldOps[field].push(mongo[field]);
          }
        }
      }
      
      const result: any[] = [];
      
      // Add merged field conditions
      for (const field in fieldOps) {
        const conditions = fieldOps[field] ?? [];
        if (conditions.length === 1) {
          result.push({ [field]: conditions[0] });
        } else if (conditions.length > 1) {
          // Merge all operator objects for this field
          let merged: any = {};
          for (const cond of conditions) {
            if (typeof cond === 'object' && cond !== null && !Array.isArray(cond)) {
              merged = { ...merged, ...cond };
            }
          }
          result.push({ [field]: merged });
        }
      }
      
      // Add logical operators
      result.push(...logicalOps);
      
      return { $and: result };
    },
    __op: '$and',
    __conds: conds,
  } as any;
}
function combineWithAnd<T>(...conds: QueryOp<T>[]): QueryOp<T> { return and(...conds); }

function or<T>(...conds: QueryOp<T>[]): QueryOp<T> {
  return {
    toMongo() {
      return { $or: conds.map(c => c.toMongo()) };
    },
    __op: '$or',
    __conds: conds,
  } as any;
}
function combineWithOr<T>(...conds: QueryOp<T>[]): QueryOp<T> { return or(...conds); }

function nor<T>(...conds: QueryOp<T>[]): QueryOp<T> {
  return {
    toMongo() {
      return { $nor: conds.map(c => c.toMongo()) };
    },
    __op: '$nor',
    __conds: conds,
  } as any;
}
function combineWithNor<T>(...conds: QueryOp<T>[]): QueryOp<T> { return nor(...conds); }

// --- $text, $geo, $elemMatch ---
function text<T>(search: string): QueryOp<T> {
  return {
    toMongo() {
      return { $text: { $search: search } };
    },
    __op: '$text',
    __search: search,
  } as any;
}
function textSearch<T>(search: string): QueryOp<T> { return text(search); }

function geoWithinPolygon<T, P extends PropertyPath<T>>(field: P, coordinates: any): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $geoWithin: { $geometry: { type: 'Polygon', coordinates: [coordinates] } } } };
    },
    __field: field,
    __op: '$geoWithin',
    __coordinates: coordinates,
  } as any;
}
function geoWithin<T, P extends PropertyPath<T>>(field: P, coordinates: any): QueryOp<T> { return geoWithinPolygon(field, coordinates); }

function geoIntersectsPoint<T, P extends PropertyPath<T>>(field: P, coordinates: any): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $geoIntersects: { $geometry: { type: 'Point', coordinates } } } };
    },
    __field: field,
    __op: '$geoIntersects',
    __coordinates: coordinates,
  } as any;
}
function geoIntersects<T, P extends PropertyPath<T>>(field: P, geometry: { type: string, coordinates: any }): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $geoIntersects: { $geometry: geometry } } };
    },
    __field: field,
    __op: '$geoIntersects',
    __geometry: geometry,
  } as any;
}

function nearPoint<T, P extends PropertyPath<T>>(field: P, coordinates: any, maxDistance: number): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $near: { $geometry: { type: 'Point', coordinates }, $maxDistance: maxDistance } } };
    },
    __field: field,
    __op: '$near',
    __coordinates: coordinates,
    __maxDistance: maxDistance,
  } as any;
}
function geoNear<T, P extends PropertyPath<T>>(field: P, geometry: { type: string, coordinates: any }, maxDistance: number): QueryOp<T> {
  return {
    toMongo() {
      return { [field]: { $near: { $geometry: geometry, $maxDistance: maxDistance } } };
    },
    __field: field,
    __op: '$near',
    __geometry: geometry,
    __maxDistance: maxDistance,
  } as any;
}


function elemMatch<T, P extends PropertyPath<T>>(field: P, match: any): QueryOp<T> {
  // Always output the operator form (do not unwrap $eq)
  function ensureOperatorForm(obj: any): any {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const out: Record<string, any> = {};
      for (const k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k]) && ('$eq' in obj[k] || '$ne' in obj[k] || '$in' in obj[k] || '$nin' in obj[k] || '$gt' in obj[k] || '$gte' in obj[k] || '$lt' in obj[k] || '$lte' in obj[k] || '$regex' in obj[k])) {
          out[k] = obj[k];
        } else {
          // Wrap plain values in $eq
          out[k] = { $eq: obj[k] };
        }
      }
      return out;
    }
    return obj;
  }
  return {
    toMongo() {
      return { [field]: { $elemMatch: ensureOperatorForm(match) } };
    },
    __field: field,
    __op: '$elemMatch',
    __match: match,
  } as any;
}

// --- Main Query Builder ---
function query<T>(...ops: QueryOp<T>[]): QueryOp<T> {
  return {
    toMongo() {
      // Merge all ops into a single Mongo query object
      const result: any = {};
      const fieldOps: Record<string, any[]> = {};
      const allLogicalBlocks: any[] = [];

      for (const op of ops) {
        const mongo = op.toMongo();
        // Logical root operators
        if ('$and' in mongo || '$or' in mongo || '$nor' in mongo || '$text' in mongo) {
          // Instead of merging, push the whole block as a logical block
          allLogicalBlocks.push(mongo);
          continue;
        }
        // Field-level
        for (const k in mongo) {
          if (!fieldOps[k]) fieldOps[k] = [];
          fieldOps[k].push(mongo[k]);
        }
      }

      // Now merge fieldOps into result
      // (do not redeclare allLogicalBlocks)
      // Always merge all operators for the same field into a single object
      for (const k in fieldOps) {
        const conds = fieldOps[k] ?? [];
        if (conds.length === 1) {
          result[k] = conds[0];
        } else if (conds.length > 1) {
          // Merge all operator objects for this field
          let merged: any = {};
          for (const cond of conds) {
            if (typeof cond === 'object' && cond !== null && !Array.isArray(cond)) {
              merged = { ...merged, ...cond };
            }
          }
          result[k] = merged;
        }
      }
      if (allLogicalBlocks.length > 0) {
        // Group logical blocks by operator key
        const logicalGroups: Record<string, any[]> = {};
        for (const block of allLogicalBlocks) {
          for (const key in block) {
            if (!logicalGroups[key]) logicalGroups[key] = [];
            logicalGroups[key].push(block[key]);
          }
        }
        // Try to merge result into logical blocks, collect unmerged fields
        // Merge all unmerged field-level conditions for the same field into a single object
        const unmergedFieldMap: Record<string, any> = {};
        const resultFieldOrder: string[] = [];
        for (const k in result) resultFieldOrder.push(k);
        // Deep merge helper for operator objects
        function deepMergeOps(a: any, b: any) {
          if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) return b;
          const out: any = { ...a };
          for (const k in b) {
            if (Object.prototype.hasOwnProperty.call(b, k)) {
              if (typeof out[k] === 'object' && typeof b[k] === 'object' && out[k] != null && b[k] != null && !Array.isArray(out[k]) && !Array.isArray(b[k])) {
                out[k] = deepMergeOps(out[k], b[k]);
              } else {
                out[k] = b[k];
              }
            }
          }
          return out;
        }
        const logicalBlockEntries: [string, any][] = [];
        for (const key of Object.keys(logicalGroups)) {
          const values = logicalGroups[key] ?? [];
          if ((key === '$or' || key === '$and' || key === '$nor') && Array.isArray(values[0]) && Object.keys(result).length > 0) {
            const arr = values[0];
            const resultFields = Object.keys(result);
            if (arr && arr.length > 0 && resultFields.length === 1) {
              const field = resultFields[0];
              if (field !== undefined && arr.every(obj => Object.prototype.hasOwnProperty.call(obj, field))) {
                for (let i = 0; i < arr.length; ++i) {
                  if (typeof arr[i][field] === 'object' && typeof result[field] === 'object' && arr[i][field] !== null && result[field] !== null && !Array.isArray(arr[i][field]) && !Array.isArray(result[field])) {
                    arr[i][field] = { ...arr[i][field], ...result[field] };
                  }
                }
                // If all objects in the array are now identical, deduplicate to a single object
                if (arr[0] !== undefined) {
                  const allSame = arr.every(obj => JSON.stringify(obj) === JSON.stringify(arr[0]));
                  logicalBlockEntries.push([key, allSame ? [arr[0]] : arr]);
                } else {
                  logicalBlockEntries.push([key, arr]);
                }
              } else {
                logicalBlockEntries.push([key, arr]);
                // Collect all result fields as unmerged
                for (const field of resultFieldOrder) {
                  if (resultFields.includes(field)) {
                    if (!unmergedFieldMap[field]) {
                      unmergedFieldMap[field] = { ...result[field] };
                    } else {
                      // Deep merge operator objects
                      unmergedFieldMap[field] = deepMergeOps(unmergedFieldMap[field], result[field]);
                    }
                  }
                }
              }
            } else {
              logicalBlockEntries.push([key, arr]);
              // Collect all result fields as unmerged
              for (const field of resultFieldOrder) {
                if (Object.prototype.hasOwnProperty.call(result, field)) {
                  if (!unmergedFieldMap[field]) {
                    unmergedFieldMap[field] = { ...result[field] };
                  } else {
                    unmergedFieldMap[field] = deepMergeOps(unmergedFieldMap[field], result[field]);
                  }
                }
              }
            }
          } else {
            logicalBlockEntries.push([key, values[0]]);
          }
        }
        // Build output in order: all logical blocks, then $and if needed
        const mergedResult: Record<string, any> = {};
        for (const [key, value] of logicalBlockEntries) {
          mergedResult[key] = value;
        }
        // (deepMergeOps already defined above)
        // Merge all operator objects for the same field across all unmerged field objects
        // Step 1: collect all objects that will go into $and
        const allFieldObjs: any[] = [];
        for (const key in unmergedFieldMap) {
          const conds = Array.isArray(unmergedFieldMap[key]) ? unmergedFieldMap[key] : [unmergedFieldMap[key]];
          for (const cond of conds) {
            if (typeof cond === 'object' && cond !== null && !Array.isArray(cond)) {
              allFieldObjs.push(cond);
            } else {
              const obj: any = {};
              obj[key] = cond;
              allFieldObjs.push(obj);
            }
          }
        }
        // Step 2: group by field and merge all operator objects for each field
        const mergedFieldMap: Record<string, any> = {};
        for (const obj of allFieldObjs) {
          for (const field in obj) {
            if (!mergedFieldMap[field]) {
              mergedFieldMap[field] = { ...obj[field] };
            } else {
              mergedFieldMap[field] = deepMergeOps(mergedFieldMap[field], obj[field]);
            }
          }
        }
        // Step 3: output one object per field in $and
        const mergedUnmergedFields: any[] = [];
        for (const field in mergedFieldMap) {
          const obj: any = {};
          obj[field] = mergedFieldMap[field];
          mergedUnmergedFields.push(obj);
        }
        if (mergedUnmergedFields.length > 0) {
          mergedResult.$and = mergedUnmergedFields;
        }
        return mergedResult;
      }
      return result;
    },
    __ops: ops,
  } as any;
}

// --- Exports ---
export {
  query,
  eq, equals, ne, notEquals, inArray, nin, notInArray, gt, greaterThan, gte, greaterThanOrEqual, lt, lessThan, lte, lessThanOrEqual,
  exists, fieldExists, notExists, fieldNotExists, regex, matchesRegex,
  and, combineWithAnd, or, combineWithOr, nor, combineWithNor,
  text, textSearch, geoWithinPolygon, geoWithin, geoIntersectsPoint, geoIntersects, nearPoint, geoNear, elemMatch
};
