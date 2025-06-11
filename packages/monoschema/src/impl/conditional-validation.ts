// Conditional validation utilities for MonoSchema
import type { 
  ConditionalRule, 
  ConditionalCondition, 
  ConditionalAction,
  DiscriminantConfig,
  MonoSchemaProperty,
  ValidationError 
} from "./types";
import { getValueAtPropertyPath } from "./validation-utils";

// Evaluate a conditional condition against a value and full object
export function evaluateCondition(
  condition: ConditionalCondition,
  value: unknown,
  fullObject: unknown
): boolean {
  if ('equals' in condition) {
    return value === condition.equals;
  }
  
  if ('in' in condition) {
    return condition.in.includes(value);
  }
  
  if ('not' in condition) {
    return !evaluateCondition(condition.not, value, fullObject);
  }
  
  if ('and' in condition) {
    return condition.and.every(c => evaluateCondition(c, value, fullObject));
  }
  
  if ('or' in condition) {
    return condition.or.some(c => evaluateCondition(c, value, fullObject));
  }
  
  if ('matches' in condition) {
    return typeof value === 'string' && condition.matches.test(value);
  }
  
  if ('range' in condition) {
    if (typeof value !== 'number') return false;
    const { min, max } = condition.range;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  }
  
  if ('exists' in condition) {
    return value !== undefined && value !== null;
  }
  
  if ('custom' in condition) {
    return condition.custom(value, fullObject);
  }
  
  return false;
}

// Apply a conditional action to transform a schema property
export function applyConditionalAction(
  baseSchema: MonoSchemaProperty,
  action: ConditionalAction
): MonoSchemaProperty {
  let transformedSchema = { ...baseSchema };
  
  // Handle required changes
  if (action.required !== undefined) {
    transformedSchema.$optional = !action.required;
  }
  
  // Handle type changes
  if (action.type !== undefined) {
    transformedSchema.$type = action.type;
  }
  
  // Handle additional constraints
  if (action.constraints !== undefined) {
    const existingConstraints = transformedSchema.$constraints || [];
    transformedSchema.$constraints = [...existingConstraints, ...action.constraints];
  }
  
  // Handle schema replacement
  if (action.schema !== undefined) {
    transformedSchema = { ...action.schema };
  }
  
  // Handle limitTo (for union types - this would need more complex logic)
  if (action.limitTo !== undefined) {
    // This is a placeholder - would need more sophisticated implementation
    // to handle limiting union types to specific values
  }
  
  return transformedSchema;
}

// Evaluate all conditional rules for a property and return the transformed schema
export async function evaluateConditionalRules(
  schema: MonoSchemaProperty,
  fullObject: unknown,
  path: string = ''
): Promise<MonoSchemaProperty> {
  if (!schema.$when || schema.$when.length === 0) {
    return schema;
  }
  
  let transformedSchema = { ...schema };
  
  for (const rule of schema.$when) {
    // Get the value of the property we're checking
    const propertyValue = getValueAtPropertyPath(fullObject, rule.property);
    
    // Evaluate the condition
    const conditionMet = evaluateCondition(rule.condition, propertyValue, fullObject);
    
    // Apply the appropriate action
    const actionToApply = conditionMet ? rule.then : rule.else;
    if (actionToApply) {
      transformedSchema = applyConditionalAction(transformedSchema, actionToApply);
    }
  }
  
  return transformedSchema;
}

// Handle discriminated union validation
export async function validateDiscriminatedUnion(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  discriminantConfig: DiscriminantConfig
): Promise<{ errors: ValidationError[]; data: unknown; resolvedSchema?: MonoSchemaProperty }> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {
      errors: [{
        path,
        message: `Expected object for discriminated union, but received ${typeof value}`,
        expected: 'Object',
        received: typeof value,
        value,
      }],
      data: value
    };
  }
  
  const discriminantValue = getValueAtPropertyPath(value, discriminantConfig.property);
  const discriminantKey = String(discriminantValue);
  
  // Find the matching schema
  let resolvedSchema = discriminantConfig.mapping[discriminantKey];
  if (!resolvedSchema && discriminantConfig.default) {
    resolvedSchema = discriminantConfig.default;
  }
  
  if (!resolvedSchema) {
    return {
      errors: [{
        path: `${path}.${discriminantConfig.property}`,
        message: `Unknown discriminant value: ${discriminantKey}`,
        expected: `One of: ${Object.keys(discriminantConfig.mapping).join(', ')}`,
        received: typeof discriminantValue,
        value: discriminantValue,
      }],
      data: value
    };
  }
  
  return {
    errors: [],
    data: value,
    resolvedSchema
  };
}

// Check if a schema has conditional validation
export function hasConditionalValidation(schema: MonoSchemaProperty): boolean {
  return !!(schema.$when && schema.$when.length > 0) || !!schema.$discriminant;
}

// Resolve the effective schema after applying all conditional rules
export async function resolveEffectiveSchema(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string = ''
): Promise<{ schema: MonoSchemaProperty; errors: ValidationError[] }> {
  const errors: ValidationError[] = [];
  
  // Handle discriminated unions first
  if (schema.$discriminant) {
    const discriminantResult = await validateDiscriminatedUnion(
      schema,
      value,
      path,
      schema.$discriminant
    );
    
    if (discriminantResult.errors.length > 0) {
      return { schema, errors: discriminantResult.errors };
    }
    
    if (discriminantResult.resolvedSchema) {
      // Recursively resolve the discriminated schema
      return resolveEffectiveSchema(discriminantResult.resolvedSchema, value, path);
    }
  }
  
  // Handle conditional rules
  const transformedSchema = await evaluateConditionalRules(schema, value, path);
  
  return { schema: transformedSchema, errors };
}
