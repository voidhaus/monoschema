// --- TypeScript type inference from MonoSchema ---
import type { Constraint } from "./constraints";

// Utility type to avoid intersection with empty object
// TODO: Figure out if we can remove this linting rule and replace {} with object
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type NonEmpty<T> = keyof T extends never ? {} : T;

// Helper types for cleaner type inference
type InferBuiltinType<T> = 
  T extends typeof String ? string :
  T extends typeof Number ? number :
  T extends typeof Boolean ? boolean :
  T extends typeof Date ? Date :
  never;

type InferCustomType<T> = T extends { tsType: infer X } ? X : unknown;

type InferArrayType<T> = T extends readonly [infer ItemType]
  ? ItemType extends { tsType: infer X }
    ? X[]
    : InferTypeFromMonoSchema<{ $type: ItemType }>[]
  : never;

// Helper types for object property inference with different modifiers
type RequiredProps<P> = {
  -readonly [K in keyof P as 
    P[K] extends { $readonly: true } ? never :
    P[K] extends { $optional: true } ? never : K
  ]: InferTypeFromMonoSchema<P[K]>
};

type OptionalProps<P> = {
  -readonly [K in keyof P as 
    P[K] extends { $readonly: true } ? never :
    P[K] extends { $optional: true } ? K : never
  ]?: InferTypeFromMonoSchema<P[K]>
};

type ReadonlyRequiredProps<P> = {
  readonly [K in keyof P as 
    P[K] extends { $readonly: true } ?
      P[K] extends { $optional: true } ? never : K
    : never
  ]: InferTypeFromMonoSchema<P[K]>
};

type ReadonlyOptionalProps<P> = {
  readonly [K in keyof P as 
    P[K] extends { $readonly: true } ?
      P[K] extends { $optional: true } ? K : never
    : never
  ]?: InferTypeFromMonoSchema<P[K]>
};

type InferObjectType<T> = T extends { $properties: infer P }
  ? NonEmpty<RequiredProps<P>> & 
    NonEmpty<OptionalProps<P>> & 
    NonEmpty<ReadonlyRequiredProps<P>> & 
    NonEmpty<ReadonlyOptionalProps<P>>
  : unknown;

// Main type inference utility - now much cleaner and easier to understand
export type InferTypeFromMonoSchema<T> = T extends { $type: infer U }
  ? U extends { tsType: unknown }
    ? InferCustomType<U>
    : U extends readonly unknown[]
      ? InferArrayType<U>
      : U extends typeof Object
        ? InferObjectType<T>
        : InferBuiltinType<U>
  : unknown;

// Schema type definitions
type MonoSchemaType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | ObjectConstructor
  | ArrayConstructor
  | ((...args: unknown[]) => { validate: (value: unknown) => unknown });

export type MonoSchemaProperty = {
  $type: MonoSchemaType | readonly MonoSchemaType[];
  $optional?: boolean;
  $readonly?: boolean;
  $properties?: Record<string, MonoSchemaProperty>;
  $constraints?: readonly Constraint[];
  // Extensible for plugin fields
  [key: string]: unknown;
};

export type MonoSchema = {
  $type: MonoSchemaType | readonly MonoSchemaType[];
  $optional?: boolean;
  $readonly?: boolean;
  $properties?: Record<string, MonoSchemaProperty>;
  $constraints?: readonly Constraint[];
  // Extensible for plugin fields
  [key: string]: unknown;
};

export type Plugin = {
  name: string;
  description?: string;
  version?: string;
  types: Array<MonoSchemaType>;
  prevalidate?: Array<(
    value: unknown,
    schema: MonoSchemaProperty,
    path: string
  ) => unknown>;
};

type ConfigureMonoSchemaOptions = {
  plugins?: Plugin[];
};

type ValidationError = {
  path: string;
  message: string;
  expected: string;
  received: string;
  value: unknown;
};

type ValidationResult<T = unknown> = {
  valid: boolean;
  errors: ValidationError[];
  data?: T;
};

// Type validation utilities
function getTypeName(type: unknown): string {
  if (
    type === String ||
    type === Number ||
    type === Boolean ||
    type === Date ||
    type === Object ||
    type === Array
  ) {
    return (type as { name: string }).name;
  }
  if (typeof type === "function") {
    return "CustomValidator";
  }
  if (Array.isArray(type)) return "Array";
  if (typeof type === "object" && type !== null && (type as { constructor?: { name?: string } }).constructor?.name)
    return (type as { constructor: { name: string } }).constructor.name;
  return typeof type;
}

function getValueTypeName(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "Array";
  if (typeof value === "object" && value && (value as Record<string, unknown>).constructor && (value as Record<string, unknown>).constructor.name)
    return (value as Record<string, unknown>).constructor.name;
  return typeof value === "string"
    ? "String"
    : typeof value === "number"
    ? "Number"
    : typeof value === "boolean"
    ? "Boolean"
    : typeof value;
}

function isCustomType(type: unknown): boolean {
  return typeof type === "function" && ![String, Number, Boolean, Date, Object, Array].includes(type as never);
}

// Validation constraint checking
function validateConstraints(
  value: unknown,
  constraints: readonly Constraint[] | undefined,
  path: string,
  expectedType: string
): ValidationError[] {
  if (!Array.isArray(constraints)) return [];
  
  const errors: ValidationError[] = [];
  for (const constraint of constraints) {
    if (typeof constraint.validate === "function") {
      const valid = constraint.validate(value);
      if (!valid) {
        errors.push({
          path,
          message: typeof constraint.message === "function" ? constraint.message(value) : "Constraint failed",
          expected: expectedType,
          received: getValueTypeName(value),
          value,
        });
      }
    }
  }
  return errors;
}

// Plugin validation
function validateCustomType(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[]
): ValidationError[] {
  // Find plugin type
  const pluginType = plugins
    .flatMap((p) => p.types)
    .find((t) => {
      if (t === schema.$type) return true;
      if (typeof t === "function" && typeof schema.$type === "function") {
        return t.name === schema.$type.name;
      }
      return false;
    });

  // If $type is a function (factory), call it; if it's an object with validate, use it directly
  let pluginInstance: { validate: (value: unknown) => unknown } | null = null;
  
  if (
    typeof schema.$type === "function" &&
    schema.$type !== String &&
    schema.$type !== Number &&
    schema.$type !== Boolean &&
    schema.$type !== Date &&
    schema.$type !== Object &&
    schema.$type !== Array
  ) {
    try {
      pluginInstance = (schema.$type as (...args: unknown[]) => { validate: (value: unknown) => unknown })();
    } catch {
      pluginInstance = null;
    }
  } else if (
    typeof schema.$type === "object" && 
    schema.$type !== null && 
    typeof (schema.$type as unknown as Record<string, unknown>).validate === "function"
  ) {
    pluginInstance = schema.$type as unknown as { validate: (value: unknown) => unknown };
  }

  if (pluginInstance && typeof pluginInstance.validate === "function") {
    const result = pluginInstance.validate(value);
    if (result && typeof result === "object" && result !== null) {
      const validationResult = result as { valid?: boolean; errors?: unknown[] };
      if (validationResult.valid === false && Array.isArray(validationResult.errors)) {
        // Patch error path
        return validationResult.errors.map((err: unknown) => {
          const error = err as Record<string, unknown>;
          return {
            path,
            message: String(error.message || "Validation failed"),
            expected: String(error.expected || "Valid value"),
            received: getValueTypeName(value),
            value,
          };
        });
      }
    }
    // If result is valid or no errors, return []
    return [];
  }

  // If pluginType is registered but no validate, treat as valid
  if (pluginType) {
    return [];
  }

  return [];
}

// Built-in type validation
function validateBuiltinType(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string
): ValidationError[] {
  const createError = (expected: string): ValidationError => ({
    path,
    message: `Expected type ${expected}, but received ${getValueTypeName(value)}`,
    expected,
    received: getValueTypeName(value),
    value,
  });

  if (schema.$type === String) {
    if (typeof value !== "string") {
      return [createError("String")];
    }
    return validateConstraints(value, schema.$constraints, path, "String");
  }

  if (schema.$type === Number) {
    if (typeof value !== "number") {
      return [createError("Number")];
    }
    return validateConstraints(value, schema.$constraints, path, "Number");
  }

  if (schema.$type === Boolean) {
    if (typeof value !== "boolean") {
      return [createError("Boolean")];
    }
    return validateConstraints(value, schema.$constraints, path, "Boolean");
  }

  if (schema.$type === Date) {
    if (!(value instanceof Date)) {
      return [createError("Date")];
    }
    return validateConstraints(value, schema.$constraints, path, "Date");
  }

  if (schema.$type === Object) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return [createError("Object")];
    }

    // Validate constraints first
    const constraintErrors = validateConstraints(value, schema.$constraints, path, "Object");
    if (constraintErrors.length > 0) return constraintErrors;

    // Validate properties
    if (schema.$properties) {
      let errors: ValidationError[] = [];
      for (const key in schema.$properties) {
        const propSchema = schema.$properties[key];
        if (!propSchema) continue;

        const propValue = (value as Record<string, unknown>)[key];
        const propPath = path ? `${path}.${key}` : key;

        if (propValue === undefined || propValue === null) {
          if (!propSchema.$optional) {
            errors.push({
              path: propPath,
              message: `Missing required property`,
              expected: getTypeName(propSchema.$type),
              received: "undefined",
              value: undefined,
            });
          }
        } else {
          errors = errors.concat(validateValue(propSchema, propValue, propPath, []));
        }
      }
      return errors;
    }
    return [];
  }

  return [];
}

// Array validation
function validateArrayType(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[]
): ValidationError[] {
  if (!Array.isArray(schema.$type)) return [];

  if (!Array.isArray(value)) {
    return [{
      path,
      message: `Expected type Array, but received ${getValueTypeName(value)}`,
      expected: "Array",
      received: getValueTypeName(value),
      value,
    }];
  }

  const itemType = schema.$type[0];
  if (itemType === undefined) {
    return [{
      path,
      message: `Array schema missing item type`,
      expected: "Array",
      received: getValueTypeName(value),
      value,
    }];
  }

  return value
    .map((item, idx) =>
      validateValue(
        { $type: itemType, $constraints: schema.$constraints },
        item,
        path ? `${path}.${idx}` : `${idx}`,
        plugins
      )
    )
    .flat();
}

// Main validation function
function validateValue(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[] = []
): ValidationError[] {
  // Handle array types
  if (Array.isArray(schema.$type)) {
    return validateArrayType(schema, value, path, plugins);
  }

  // Handle custom plugin types
  if (
    isCustomType(schema.$type) || 
    (typeof schema.$type === "object" && 
     schema.$type !== null && 
     typeof (schema.$type as unknown as Record<string, unknown>).validate === "function")
  ) {
    return validateCustomType(schema, value, path, plugins);
  }

  // Handle built-in types
  return validateBuiltinType(schema, value, path);
}

// Prevalidation processing
function runPrevalidation(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[]
): unknown {
  let result = value;
  
  // Run all plugin prevalidate functions for this property
  for (const plugin of plugins) {
    if (plugin.prevalidate) {
      for (const fn of plugin.prevalidate) {
        result = fn(result, schema, path);
      }
    }
  }

  // Recurse for arrays and objects
  if (Array.isArray(schema.$type) && Array.isArray(result)) {
    const itemType = schema.$type[0];
    return result.map((item, idx) =>
      runPrevalidation(
        { $type: itemType, $constraints: schema.$constraints },
        item,
        path ? `${path}.${idx}` : `${idx}`,
        plugins
      )
    );
  }

  if (schema.$type === Object && schema.$properties && typeof result === 'object' && result !== null && !Array.isArray(result)) {
    const out: Record<string, unknown> = { ...result };
    for (const key in schema.$properties) {
      if (Object.prototype.hasOwnProperty.call(schema.$properties, key)) {
        const propSchema = schema.$properties[key];
        if (!propSchema) continue;
        out[key] = runPrevalidation(
          propSchema,
          (result as Record<string, unknown>)[key],
          path ? `${path}.${key}` : key,
          plugins
        );
      }
    }
    return out;
  }
  
  return result;
}

// Helper function to get value at a property path
function getValueAtPropertyPath(obj: unknown, path: string): unknown {
  if (!path || typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return current;
}

// Helper function to get schema at a property path
function getSchemaAtPropertyPath(schema: unknown, path: string): unknown {
  if (!path || typeof schema !== 'object' || schema === null) {
    return schema;
  }
  
  const keys = path.split('.');
  let current: unknown = schema;
  
  for (const key of keys) {
    if (!current || typeof current !== 'object') return undefined;
    const currentSchema = current as Record<string, unknown>;
    if (currentSchema.$properties && key in (currentSchema.$properties as Record<string, unknown>)) {
      current = (currentSchema.$properties as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return current;
}

// Main configuration function
function configureMonoSchema(options: ConfigureMonoSchemaOptions = {}) {
  const plugins = options.plugins || [];
  return {
    validate: <T extends MonoSchema>(schema: T) => 
      (value: unknown): ValidationResult<InferTypeFromMonoSchema<T>> => {
        try {
          const prevalidated = runPrevalidation(schema, value, "", plugins);
          const errors = validateValue(schema, prevalidated, "", plugins);
          return {
            valid: errors.length === 0,
            errors,
            data: errors.length === 0 ? (prevalidated as InferTypeFromMonoSchema<T>) : undefined,
          };
        } catch (error) {
          if (error instanceof Error) {
            // Parse transformation errors
            const match = error.message.match(/^(.+?): (.+)$/);
            if (match) {
              const [, path, message] = match;
              // Extract the field value from the original input
              const fieldValue = getValueAtPropertyPath(value, path || '');
              // Try to get the property schema at the error path
              const propertySchema = getSchemaAtPropertyPath(schema, path || '');
              return {
                valid: false,
                errors: [{
                  path: path || '',
                  message: message || error.message,
                  expected: getTypeName((propertySchema as MonoSchemaProperty)?.$type ?? schema.$type),
                  received: getValueTypeName(fieldValue),
                  value: fieldValue,
                }],
                data: undefined,
              };
            }
          }
          throw error;
        }
      },
  };
}

// --- Type inference for property paths ---

// Helper: Join property keys for nested paths
type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

// Recursively get all property paths from an inferred TypeScript type (limited depth)
type PropertyPathHelper<T, Depth extends readonly unknown[] = []> = 
  Depth['length'] extends 3 ? never : // Limit recursion depth to 3
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends string
          ? T[K] extends Record<string, unknown>
            ? K | Join<K, PropertyPathHelper<T[K], [...Depth, unknown]>>
            : K
          : never;
      }[keyof T]
    : never;

// Extract only string keys from keyof T
type StringKeys<T> = Extract<keyof T, string>;

// Property paths for inferred types
export type InferredPropertyPath<T> = PropertyPathHelper<T> extends string
  ? PropertyPathHelper<T>
  : StringKeys<T>;

// Value at path type - extracts the type at a given property path
export type ValueAtPath<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? ValueAtPath<T[K], Rest>
    : never
  : never;

// Recursively get all property paths from a schema
type MonogSchemaPropertPathHelper<T> = T extends { $properties: infer P }
  ? {
      [K in keyof P]: P[K] extends { $properties: unknown }
        ? K extends string
          ? K | Join<K, MonogSchemaPropertPathHelper<P[K]>>
          : never
        : K;
    }[keyof P]
  : never;

// Exported type for property path inference
export type MonogSchemaPropertPath<T> = MonogSchemaPropertPathHelper<T> extends string
  ? MonogSchemaPropertPathHelper<T>
  : never;

export { configureMonoSchema };
