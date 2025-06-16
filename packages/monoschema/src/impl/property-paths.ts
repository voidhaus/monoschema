// Property path type inference utilities for MonoSchema

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
