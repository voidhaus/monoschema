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
