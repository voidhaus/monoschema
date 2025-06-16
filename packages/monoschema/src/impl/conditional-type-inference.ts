// Type inference extensions for conditional validation
import type { ConditionalRule, ConditionalAction } from './types';
import type { InferTypeFromMonoSchema } from './type-inference';

// Helper to check if a condition can match a specific value type-wise
type CanConditionMatch<Condition, Value> = 
  Condition extends { equals: infer V }
    ? V extends Value ? true : false
  : Condition extends { in: readonly (infer V)[] }
    ? Value extends V ? true : false
  : Condition extends { not: infer NotCondition }
    ? CanConditionMatch<NotCondition, Value> extends true ? false : true
  : true; // For complex conditions (and, or, custom, range, matches, exists), assume they can match

// Apply conditional action to transform a schema type
type ApplyConditionalAction<BaseSchema, Action extends ConditionalAction> =
  Action extends { schema: infer NewSchema }
    ? NewSchema // Complete schema replacement
    : Action extends { type: infer NewType }
      ? { $type: NewType } & Omit<BaseSchema, '$type'> // Type change
      : Action extends { required: infer Required }
        ? Required extends true
          ? Omit<BaseSchema, '$optional'> // Remove $optional to make required
          : BaseSchema & { $optional: true } // Add $optional
        : BaseSchema; // No change

// Evaluate a single conditional rule for a specific property value
type EvaluateConditionalRule<
  Rule extends ConditionalRule,
  PropertyValue,
  BaseSchema
> = Rule extends {
  property: string;
  condition: infer Condition;
  then: infer ThenAction;
  else?: infer ElseAction;
}
  ? CanConditionMatch<Condition, PropertyValue> extends true
    ? ThenAction extends ConditionalAction
      ? ApplyConditionalAction<BaseSchema, ThenAction>
      : BaseSchema
    : ElseAction extends ConditionalAction
      ? ApplyConditionalAction<BaseSchema, ElseAction>
      : BaseSchema
  : BaseSchema;

// Handle discriminated unions with $discriminant
export type InferDiscriminatedUnion<Schema> = Schema extends {
  $discriminant: {
    property: string;
    mapping: infer Mapping;
    default?: infer Default;
  }
}
  ? Mapping extends Record<string | number, unknown>
    ? {
        [K in keyof Mapping]: InferTypeFromMonoSchema<Mapping[K]>
      }[keyof Mapping]
    : Default extends object
      ? InferTypeFromMonoSchema<Default>
      : unknown
  : unknown;

// Simplified conditional type inference for basic cases
export type InferBasicConditionalType<Schema, DiscriminantValue> = 
  Schema extends { $when?: readonly (infer Rules)[] }
    ? Rules extends ConditionalRule
      ? InferTypeFromMonoSchema<EvaluateConditionalRule<Rules, DiscriminantValue, Schema>>
      : InferTypeFromMonoSchema<Schema>
    : InferTypeFromMonoSchema<Schema>;

// Enhanced main type inference utility with conditional support
export type InferTypeFromMonoSchemaWithConditional<T> = T extends { $discriminant: unknown }
  ? InferDiscriminatedUnion<T>
  : InferTypeFromMonoSchema<T>;
