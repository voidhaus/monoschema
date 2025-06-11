# Conditional Validation and Type Inference Proposal for MonoSchema

## Overview

This proposal introduces a way to add conditional validation and type inference to MonoSchema. This will allow properties to be conditionally required, have different type constraints, or be limited to certain values based on the values of other properties in the schema.

## Current State

MonoSchema currently supports:
- Basic type validation (`String`, `Number`, `Boolean`, etc.)
- Optional properties (`$optional: true`)
- Constraints (`$constraints: [...]`)
- Custom types via plugins
- Strong TypeScript type inference

## Proposed Solution

### 1. Conditional Schema Properties

Add new schema properties:

```typescript
export type MonoSchemaProperty = {
  $type: MonoSchemaType | readonly MonoSchemaType[];
  $optional?: boolean;
  $readonly?: boolean;
  $properties?: Record<string, MonoSchemaProperty>;
  $constraints?: readonly Constraint[];
  
  // NEW: Conditional properties
  $when?: ConditionalRule[];
  $discriminant?: DiscriminantConfig;
  
  [key: string]: unknown;
};
```

### 2. Core Types

```typescript
// Conditional rule that modifies property behavior based on other properties
export type ConditionalRule = {
  // The property path to check (e.g., "type", "parent.category")
  property: string;
  
  // The condition to match
  condition: ConditionalCondition;
  
  // What to do when condition matches
  then: ConditionalAction;
  
  // Optional: what to do when condition doesn't match
  else?: ConditionalAction;
};

export type ConditionalCondition = 
  | { equals: unknown }
  | { in: unknown[] }
  | { not: ConditionalCondition }
  | { and: ConditionalCondition[] }
  | { or: ConditionalCondition[] }
  | { matches: RegExp }  // for strings
  | { range: { min?: number; max?: number } }  // for numbers
  | { exists: true }
  | { custom: (value: unknown, fullObject: unknown) => boolean };

export type ConditionalAction = {
  // Make this property required/optional
  required?: boolean;
  
  // Change the type completely
  type?: MonoSchemaType | readonly MonoSchemaType[];
  
  // Add additional constraints
  constraints?: readonly Constraint[];
  
  // For union types: limit to specific subset
  limitTo?: unknown[];
  
  // Transform the property schema entirely
  schema?: MonoSchemaProperty;
};

// For discriminated unions
export type DiscriminantConfig = {
  // The property that acts as the discriminant
  property: string;
  
  // Map of discriminant values to schemas
  mapping: Record<string | number, MonoSchemaProperty>;
  
  // Default schema if discriminant value not found
  default?: MonoSchemaProperty;
};
```

### 3. Usage Examples

#### Example 1: Conditional Required Fields

```typescript
const userSchema = {
  $type: Object,
  $properties: {
    accountType: { 
      $type: AccountTypeEnum  // "personal" | "business"
    },
    
    // Only required if accountType is "business"
    companyName: { 
      $type: String,
      $when: [{
        property: "accountType",
        condition: { equals: "business" },
        then: { required: true }
      }]
    },
    
    // Only required if accountType is "personal"  
    firstName: {
      $type: String,
      $when: [{
        property: "accountType", 
        condition: { equals: "personal" },
        then: { required: true }
      }]
    }
  }
} as const;

type User = InferTypeFromMonoSchema<typeof userSchema>;
// Results in:
// type User = 
//   | { accountType: "personal"; firstName: string; companyName?: string }
//   | { accountType: "business"; companyName: string; firstName?: string }
```

#### Example 2: Conditional Types

```typescript
const eventSchema = {
  $type: Object,
  $properties: {
    type: { 
      $type: EventTypeEnum  // "webhook" | "email" | "sms"
    },
    
    // Different config types based on event type
    config: {
      $type: Object,
      $when: [
        {
          property: "type",
          condition: { equals: "webhook" },
          then: { 
            schema: {
              $type: Object,
              $properties: {
                url: { $type: String, $constraints: [url()] },
                method: { $type: HttpMethodEnum },
                headers: { $type: Object, $optional: true }
              }
            }
          }
        },
        {
          property: "type", 
          condition: { equals: "email" },
          then: {
            schema: {
              $type: Object,
              $properties: {
                to: { $type: String, $constraints: [email()] },
                subject: { $type: String },
                template: { $type: String }
              }
            }
          }
        }
      ]
    }
  }
} as const;

type Event = InferTypeFromMonoSchema<typeof eventSchema>;
// Results in:
// type Event = 
//   | { type: "webhook"; config: { url: string; method: HttpMethod; headers?: object } }
//   | { type: "email"; config: { to: string; subject: string; template: string } }
//   | { type: "sms"; config: object }  // fallback to base Object type
```

#### Example 3: Discriminated Unions (Alternative Syntax)

```typescript
const shapeSchema = {
  $type: Object,
  $discriminant: {
    property: "type",
    mapping: {
      "circle": {
        $type: Object,
        $properties: {
          type: { $type: () => "circle" as const },
          radius: { $type: Number, $constraints: [min(0)] }
        }
      },
      "rectangle": {
        $type: Object, 
        $properties: {
          type: { $type: () => "rectangle" as const },
          width: { $type: Number, $constraints: [min(0)] },
          height: { $type: Number, $constraints: [min(0)] }
        }
      }
    }
  }
} as const;

type Shape = InferTypeFromMonoSchema<typeof shapeSchema>;
// Results in:
// type Shape = 
//   | { type: "circle"; radius: number }
//   | { type: "rectangle"; width: number; height: number }
```

#### Example 4: Complex Conditions

```typescript
const productSchema = {
  $type: Object,
  $properties: {
    category: { $type: ProductCategoryEnum },
    hasVariants: { $type: Boolean },
    price: { $type: Number },
    
    // Only required for physical products with variants
    variants: {
      $type: [VariantSchema],
      $when: [{
        property: "category",
        condition: { 
          and: [
            { in: ["clothing", "electronics", "books"] },
            { custom: (_, obj) => (obj as any).hasVariants === true }
          ]
        },
        then: { required: true }
      }]
    },
    
    // Shipping required for physical products only
    shipping: {
      $type: ShippingSchema,
      $when: [{
        property: "category",
        condition: { not: { equals: "digital" } },
        then: { required: true }
      }]
    }
  }
} as const;
```

### 4. Type Inference Implementation

The type inference would need to be enhanced to handle conditional types:

```typescript
// New helper types for conditional inference
type InferConditionalType<T, Conditions> = 
  // Complex type magic to create union types based on conditions
  // This would analyze $when and $discriminant to create proper unions

// Enhanced main inference type  
export type InferTypeFromMonoSchema<T> = T extends { $discriminant: infer D }
  ? InferDiscriminatedUnion<T, D>
  : T extends { $when: infer W }
    ? InferConditionalType<T, W>
    : // ... existing inference logic
```

### 5. Validation Implementation

The validation logic would need to:

1. **Evaluate conditions** - Check if conditional rules match the current object
2. **Apply transformations** - Modify the effective schema based on matching conditions  
3. **Validate with modified schema** - Run normal validation with the transformed schema

```typescript
// New validation functions
export async function evaluateConditionalRules(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string
): Promise<MonoSchemaProperty> {
  // Evaluate $when rules and apply transformations
  // Return modified schema
}

export async function validateDiscriminatedUnion(
  schema: MonoSchemaProperty,
  value: unknown, 
  path: string,
  // ... other params
): Promise<{ errors: ValidationError[]; data: unknown }> {
  // Handle $discriminant validation
}
```

### 6. Backward Compatibility

This proposal is fully backward compatible:
- Existing schemas work unchanged
- New properties (`$when`, `$discriminant`) are optional
- No breaking changes to existing APIs

### 7. Benefits

1. **Type Safety**: Full TypeScript support with proper union types
2. **Runtime Validation**: Conditional validation rules enforced at runtime
3. **Ergonomic**: Clean, declarative syntax for complex validation rules
4. **Flexible**: Handles many conditional patterns (required fields, type changes, discriminated unions)
5. **Performant**: Rules evaluated efficiently during validation
6. **Composable**: Works with existing constraints and plugins

### 8. Implementation Plan

1. **Phase 1**: Core types and basic conditional rules (`$when` with simple conditions)
2. **Phase 2**: Complex conditions (`and`, `or`, `not`, `custom`)
3. **Phase 3**: Discriminated unions (`$discriminant`)
4. **Phase 4**: Type inference enhancements
5. **Phase 5**: Performance optimizations and edge cases

This approach provides a powerful, type-safe way to handle conditional validation while maintaining MonoSchema's design principles and backward compatibility.
