// --- TypeScript type inference from MonoSchema ---
import type { Constraint } from "./constraints";

// Transformer type definition
type TransformerObject = {
  input: any;
  output: any;
  transform: (value: any) => any;
};

type TransformerFactory = () => TransformerObject;

// Only allow valid transformer functions (that return proper transformer objects)
type Transformer = TransformerFactory;
// Recursively infer the TypeScript type from a MonoSchema definition
export type InferTypeFromMonoSchema<T> =
  T extends { $type: infer U }
    ? U extends { tsType: infer X }
      ? X
      : U extends readonly [infer ArrType]
        ? ArrType extends { tsType: infer X }
          ? X[]
          : InferTypeFromMonoSchema<{ $type: ArrType }> []
        : U extends typeof String
          ? string
        : U extends typeof Number
          ? number
        : U extends typeof Boolean
          ? boolean
        : U extends typeof Date
          ? Date
        : U extends typeof Object
          ? T extends { $properties: infer P }
            ? {
                -readonly [K in keyof P as P[K] extends { $readonly: true } ? never : K]: P[K] extends { $optional: true }
                  ? InferTypeFromMonoSchema<P[K]> | undefined
                  : InferTypeFromMonoSchema<P[K]>
              } & {
                readonly [K in keyof P as P[K] extends { $readonly: true } ? K : never]: P[K] extends { $optional: true }
                  ? InferTypeFromMonoSchema<P[K]> | undefined
                  : InferTypeFromMonoSchema<P[K]>
              }
            : unknown
          : unknown
    : unknown;
type MonoSchemaType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | ObjectConstructor
  | ArrayConstructor
  | ((...args: any[]) => { validate: (value: unknown) => any });

type MonoSchemaProperty =
  | {
      $type: MonoSchemaType | readonly MonoSchemaType[];
      $optional?: boolean;
      $readonly?: boolean;
      $properties?: Record<string, MonoSchemaProperty>;
      $constraints?: readonly Constraint[];
      $transformers?: readonly Transformer[];
    }
  | MonoSchema;

type MonoSchema = {
  $type: MonoSchemaType | readonly MonoSchemaType[];
  $optional?: boolean;
  $readonly?: boolean;
  $properties?: Record<string, MonoSchemaProperty>;
  $constraints?: readonly Constraint[];
  $transformers?: readonly Transformer[];
};

type Plugin = {
  name: string;
  description?: string;
  version?: string;
  types: Array<MonoSchemaType>;
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

function getTypeName(type: any): string {
  if (
    type === String ||
    type === Number ||
    type === Boolean ||
    type === Date ||
    type === Object ||
    type === Array
  ) {
    return type.name;
  }
  if (typeof type === "function") {
    return "CustomValidator";
  }
  if (Array.isArray(type)) return "Array";
  if (typeof type === "object" && type !== null && type.constructor && type.constructor.name)
    return type.constructor.name;
  return typeof type;
}

function getValueTypeName(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "Array";
  if (typeof value === "object" && value && (value as any).constructor && (value as any).constructor.name)
    return (value as any).constructor.name;
  return typeof value === "string"
    ? "String"
    : typeof value === "number"
    ? "Number"
    : typeof value === "boolean"
    ? "Boolean"
    : typeof value;
}

function isCustomType(type: any): boolean {
  return typeof type === "function" && ![String, Number, Boolean, Date, Object, Array].includes(type);
}

function validateValue(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[] = []
): ValidationError[] {
  // Handle array of types (for arrays)
  if (Array.isArray(schema.$type)) {
    if (!Array.isArray(value)) {
      return [
        {
          path,
          message: `Expected type Array, but received ${getValueTypeName(value)}`,
          expected: "Array",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    // Validate each item in the array
    const itemType = schema.$type[0];
    if (itemType === undefined) {
      return [
        {
          path,
          message: `Array schema missing item type`,
          expected: "Array",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    return value
      .map((item, idx) =>
        validateValue(
          { $type: itemType, $constraints: (schema as any).$constraints },
          item,
          path ? `${path}.${idx}` : `${idx}`,
          plugins
        )
      )
      .flat();
  }

  // Handle custom plugin types
  if (isCustomType(schema.$type) || (typeof schema.$type === "object" && schema.$type !== null && typeof (schema.$type as any).validate === "function")) {
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
    let pluginInstance: any = null;
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
        pluginInstance = (schema.$type as (...args: any[]) => { validate: (value: unknown) => any })();
      } catch (e) {
        pluginInstance = null;
      }
    } else if (typeof schema.$type === "object" && schema.$type !== null && typeof (schema.$type as any).validate === "function") {
      pluginInstance = schema.$type;
    }
    if (pluginInstance && typeof (pluginInstance as { validate: (value: unknown) => any }).validate === "function") {
      const result = (pluginInstance as { validate: (value: unknown) => any }).validate(value);
      if (result && result.valid === false && Array.isArray(result.errors)) {
        // Patch error path
        return result.errors.map((err: any) => ({
          path,
          message: err.message,
          expected: err.expected,
          received: getValueTypeName(value),
          value,
        }));
      }
      // If result is valid or no errors, return []
      return [];
    }
    // If pluginType is registered but no validate, treat as valid
    if (pluginType) {
      return [];
    }
  }

  // Handle built-in types
  if (schema.$type === String) {
    if (typeof value !== "string") {
      return [
        {
          path,
          message: `Expected type String, but received ${getValueTypeName(value)}`,
          expected: "String",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    // Constraints for string
    if (Array.isArray((schema as any).$constraints)) {
      const constraints = (schema as any).$constraints;
      const constraintErrors = constraints
        .map((constraint: any) => {
          if (typeof constraint.validate === "function") {
            const valid = constraint.validate(value);
            if (!valid) {
              return {
                path,
                message: typeof constraint.message === "function" ? constraint.message(value) : "Constraint failed",
                expected: "String",
                received: getValueTypeName(value),
                value,
              };
            }
          }
          return null;
        })
        .filter(Boolean);
      if (constraintErrors.length > 0) return constraintErrors as ValidationError[];
    }
    return [];
  }
  if (schema.$type === Number) {
    if (typeof value !== "number") {
      return [
        {
          path,
          message: `Expected type Number, but received ${getValueTypeName(value)}`,
          expected: "Number",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    // Constraints for number
    if (Array.isArray((schema as any).$constraints)) {
      const constraints = (schema as any).$constraints;
      const constraintErrors = constraints
        .map((constraint: any) => {
          if (typeof constraint.validate === "function") {
            const valid = constraint.validate(value);
            if (!valid) {
              return {
                path,
                message: typeof constraint.message === "function" ? constraint.message(value) : "Constraint failed",
                expected: "Number",
                received: getValueTypeName(value),
                value,
              };
            }
          }
          return null;
        })
        .filter(Boolean);
      if (constraintErrors.length > 0) return constraintErrors as ValidationError[];
    }
    return [];
  }
  if (schema.$type === Boolean) {
    if (typeof value !== "boolean") {
      return [
        {
          path,
          message: `Expected type Boolean, but received ${getValueTypeName(value)}`,
          expected: "Boolean",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    // Constraints for boolean (if ever needed)
    if (Array.isArray((schema as any).$constraints)) {
      const constraints = (schema as any).$constraints;
      const constraintErrors = constraints
        .map((constraint: any) => {
          if (typeof constraint.validate === "function") {
            const valid = constraint.validate(value);
            if (!valid) {
              return {
                path,
                message: typeof constraint.message === "function" ? constraint.message(value) : "Constraint failed",
                expected: "Boolean",
                received: getValueTypeName(value),
                value,
              };
            }
          }
          return null;
        })
        .filter(Boolean);
      if (constraintErrors.length > 0) return constraintErrors as ValidationError[];
    }
    return [];
  }
  if (schema.$type === Date) {
    if (!(value instanceof Date)) {
      return [
        {
          path,
          message: `Expected type Date, but received ${getValueTypeName(value)}`,
          expected: "Date",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    // Constraints for date (if ever needed)
    if (Array.isArray((schema as any).$constraints)) {
      const constraints = (schema as any).$constraints;
      const constraintErrors = constraints
        .map((constraint: any) => {
          if (typeof constraint.validate === "function") {
            const valid = constraint.validate(value);
            if (!valid) {
              return {
                path,
                message: typeof constraint.message === "function" ? constraint.message(value) : "Constraint failed",
                expected: "Date",
                received: getValueTypeName(value),
                value,
              };
            }
          }
          return null;
        })
        .filter(Boolean);
      if (constraintErrors.length > 0) return constraintErrors as ValidationError[];
    }
    return [];
  }
  if (schema.$type === Object) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return [
        {
          path,
          message: `Expected type Object, but received ${getValueTypeName(value)}`,
          expected: "Object",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    // Constraints for object (if ever needed)
    if (Array.isArray((schema as any).$constraints)) {
      const constraints = (schema as any).$constraints;
      const constraintErrors = constraints
        .map((constraint: any) => {
          if (typeof constraint.validate === "function") {
            const valid = constraint.validate(value);
            if (!valid) {
              return {
                path,
                message: typeof constraint.message === "function" ? constraint.message(value) : "Constraint failed",
                expected: "Object",
                received: getValueTypeName(value),
                value,
              };
            }
          }
          return null;
        })
        .filter(Boolean);
      if (constraintErrors.length > 0) return constraintErrors as ValidationError[];
    }
    // Validate properties
    if (schema.$properties) {
      let errors: ValidationError[] = [];
      for (const key in schema.$properties) {
        const propSchema = schema.$properties[key];
        if (!propSchema) continue;
        if (
          (value as any)[key] === undefined ||
          (value as any)[key] === null
        ) {
          if (!propSchema.$optional) {
            errors.push({
              path: path ? `${path}.${key}` : key,
              message: `Missing required property`,
              expected: getTypeName((propSchema as any).$type),
              received: "undefined",
              value: undefined,
            });
          }
        } else {
          errors = errors.concat(
            validateValue(
              propSchema,
              (value as any)[key],
              path ? `${path}.${key}` : key,
              plugins
            )
          );
        }
      }
      return errors;
    }
    return [];
  }
  return [];
}

// Transform data using transformers
function transformValue(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[] = []
): unknown {
  // Handle array of types (for arrays)
  if (Array.isArray(schema.$type)) {
    if (!Array.isArray(value)) {
      return value; // Let validation handle the error
    }
    // Transform each item in the array
    const itemType = schema.$type[0];
    if (itemType === undefined) {
      return value; // Let validation handle the error
    }
    return value.map((item, idx) =>
      transformValue(
        { $type: itemType, $transformers: (schema as any).$transformers },
        item,
        path ? `${path}.${idx}` : `${idx}`,
        plugins
      )
    );
  }

  // Handle object properties
  if (schema.$type === Object && (schema as any).$properties) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return value; // Let validation handle the error
    }
    const transformedObject: any = {};
    const properties = (schema as any).$properties;
    for (const [key, propSchema] of Object.entries(properties)) {
      const propValue = (value as any)[key];
      const propPath = path ? `${path}.${key}` : key;
      transformedObject[key] = transformValue(propSchema as MonoSchemaProperty, propValue, propPath, plugins);
    }
    return transformedObject;
  }

  // Apply transformers if available
  if (Array.isArray((schema as any).$transformers)) {
    const transformers = (schema as any).$transformers;
    let transformedValue = value;
    
    for (const transformer of transformers) {
      // Validate transformer structure
      if (typeof transformer !== 'function') {
        throw new Error('Invalid transformer provided. Expected a function with input and output types defined, as well as a transform function.');
      }
      
      const transformerInstance = transformer();
      if (!transformerInstance || 
          typeof transformerInstance.transform !== 'function' ||
          !transformerInstance.input ||
          !transformerInstance.output) {
        throw new Error('Invalid transformer provided. Expected a function with input and output types defined, as well as a transform function.');
      }
      
      try {
        transformedValue = transformerInstance.transform(transformedValue);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`${path}: ${error.message}`);
        }
        throw error;
      }
    }
    return transformedValue;
  }

  return value;
}

function configureMonoSchema(options: ConfigureMonoSchemaOptions = {}) {
  const plugins = options.plugins || [];
  return {
    validate: <T extends MonoSchema>(schema: T) => (value: InferTypeFromMonoSchema<T>): ValidationResult<InferTypeFromMonoSchema<T>> => {
      const errors = validateValue(schema, value, "", plugins);
      return {
        valid: errors.length === 0,
        errors,
        data: errors.length === 0 ? value : undefined,
      };
    },
    transformAndValidate: <T extends MonoSchema>(schema: T) => (value: unknown): ValidationResult<InferTypeFromMonoSchema<T>> => {
      try {
        const transformedValue = transformValue(schema, value, "", plugins);
        const errors = validateValue(schema, transformedValue, "", plugins);
        return {
          valid: errors.length === 0,
          errors,
          data: errors.length === 0 ? (transformedValue as InferTypeFromMonoSchema<T>) : undefined,
        };
      } catch (error) {
        if (error instanceof Error) {
          // Parse transformation errors
          const match = error.message.match(/^(.+?): (.+)$/);
          if (match) {
            const [, path, message] = match;
            // Extract the field value from the original input
            const fieldValue = getValueAtPropertyPath(value, path || '');
            return {
              valid: false,
              errors: [{
                path: path || '',
                message: message || error.message,
                expected: 'Number', // Default for stringToNumber transformer
                received: 'String', // Default for stringToNumber transformer
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

// Helper function to get value at a property path
function getValueAtPropertyPath(obj: unknown, path: string): unknown {
  if (!path || typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) {
      return undefined;
    }
    current = (current as any)[key];
  }
  
  return current;
}

// --- Type inference for property paths ---

// Helper: Join property keys for nested paths
type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

// Recursively get all property paths from an inferred TypeScript type (limited depth)
type PropertyPathHelper<T, Depth extends readonly any[] = []> = 
  Depth['length'] extends 3 ? never : // Limit recursion depth to 3
  T extends Record<string, any>
    ? {
        [K in keyof T]: K extends string
          ? T[K] extends Record<string, any>
            ? K | Join<K, PropertyPathHelper<T[K], [...Depth, any]>>
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
      [K in keyof P]: P[K] extends { $properties: any }
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