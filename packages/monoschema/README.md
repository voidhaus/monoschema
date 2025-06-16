# monoschema

A minimal, type-safe schema validation library for TypeScript projects. Provides a set of composable constraints and utilities for validating data structures, with a focus on developer ergonomics and type inference.

## Features

- **Type-safe schema definitions**
- **Composable constraints** for numbers, strings, arrays, objects, and more
- **Built-in validators** for common formats (email, URL, IP, UUID, MAC, base64, etc.)
- **Custom constraint support**
- **Type inference** for validated data
- **Conditional validation** with `$when` rules and discriminated unions
- **Zero dependencies**

## Installation

```sh
pnpm add @voidhaus/monoschema
# or
yarn add @voidhaus/monoschema
# or
npm install @voidhaus/monoschema
```

### Extensions

Check out `monoschema-mongo` and `monoschema-transformer`

## Usage

### Basic Schema Validation

```ts
import { configureMonoSchema, type InferTypeFromMonoSchema } from '@voidhaus/monoschema';
import { min, minLength, max, email } from '@voidhaus/monoschema/constraints';

const userSchema = {
  $type: Object,
  $properties: {
    name: { $type: String, $constraints: [minLength(2)] },
    age: { $type: Number, $constraints: [min(1), max(120)] },
    email: { $type: String, $constraints: [email()], $optional: true },
  }
} as const;

// Infer the TypeScript type from the schema
type User = InferTypeFromMonoSchema<typeof userSchema>;
// Result: { name: string; age: number; email?: string }

const monoSchema = configureMonoSchema();
const validate = monoSchema.validate(userSchema);

// Valid data
const validUser = {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
};

const result = await validate(validUser);
console.log(result.valid); // true
console.log(result.data); // { name: 'Alice', age: 30, email: 'alice@example.com' }

// Invalid data
const invalidUser = {
  name: 'A', // too short
  age: 200,  // too high
  email: 'not-an-email' // invalid email
};

const invalidResult = await validate(invalidUser);
console.log(invalidResult.valid); // false
console.log(invalidResult.errors);
// [
//   { path: 'name', message: 'String length 1 is less than minimum 2', ... },
//   { path: 'age', message: 'Value 200 is greater than maximum 120', ... },
//   { path: 'email', message: 'String not-an-email...', ... }
// ]
```

### Custom Constraints

```ts
import { Constraint } from '@voidhaus/monoschema/constraints';

const startsWithA: Constraint = {
  validate: (value) => typeof value === 'string' && value.startsWith('A'),
  message: (value) => `Value ${value} does not start with 'A'`,
};
```

### Type Inference with Conditional Validation

MonoSchema provides type-safe inference even with conditional validation:

```ts
import { type InferTypeFromMonoSchema } from '@voidhaus/monoschema';

const eventSchema = {
  $type: Object,
  $discriminant: {
    property: "type",
    mapping: {
      "email": {
        $type: Object,
        $properties: {
          type: { $type: String },
          to: { $type: String },
          subject: { $type: String },
          body: { $type: String }
        }
      },
      "webhook": {
        $type: Object,
        $properties: {
          type: { $type: String },
          url: { $type: String },
          method: { $type: String }
        }
      }
    }
  }
} as const;

// TypeScript automatically infers the discriminated union type
type Event = InferTypeFromMonoSchema<typeof eventSchema>;
// Result:
// type Event = 
//   | { type: "email"; to: string; subject: string; body: string }
//   | { type: "webhook"; url: string; method: string }

const emailEvent: Event = {
  type: "email",
  to: "user@example.com", 
  subject: "Welcome!",
  body: "Thanks for signing up"
};

const webhookEvent: Event = {
  type: "webhook",
  url: "https://api.example.com/webhook",
  method: "POST"
};
```

### Conditional Validation

MonoSchema supports powerful conditional validation using `$when` rules and discriminated unions.

#### Conditional Required Fields

Make fields required based on other property values:

```ts
import { configureMonoSchema } from '@voidhaus/monoschema';

const userSchema = {
  $type: Object,
  $properties: {
    accountType: { $type: String }, // "personal" | "business"
    
    // Only required if accountType is "business"
    companyName: { 
      $type: String,
      $optional: true,
      $when: [{
        property: "accountType",
        condition: { equals: "business" },
        then: { required: true }
      }]
    },
    
    // Only required if accountType is "personal"  
    firstName: {
      $type: String,
      $optional: true,
      $when: [{
        property: "accountType", 
        condition: { equals: "personal" },
        then: { required: true }
      }]
    }
  }
} as const;

const monoSchema = configureMonoSchema();
const validate = monoSchema.validate(userSchema);

// Business account - requires companyName
await validate({
  accountType: "business",
  companyName: "ACME Corp"
}); // ✅ Valid

// Personal account - requires firstName
await validate({
  accountType: "personal", 
  firstName: "John"
}); // ✅ Valid
```

#### Discriminated Unions

Handle different schemas based on a discriminant property:

```ts
const shapeSchema = {
  $type: Object,
  $discriminant: {
    property: "type",
    mapping: {
      "circle": {
        $type: Object,
        $properties: {
          type: { $type: String },
          radius: { $type: Number }
        }
      },
      "rectangle": {
        $type: Object, 
        $properties: {
          type: { $type: String },
          width: { $type: Number },
          height: { $type: Number }
        }
      }
    }
  }
} as const;

const validate = monoSchema.validate(shapeSchema);

await validate({
  type: "circle",
  radius: 5
}); // ✅ Valid

await validate({
  type: "rectangle",
  width: 10,
  height: 5
}); // ✅ Valid
```

#### Complex Conditions

Use advanced condition matching:

```ts
const productSchema = {
  $type: Object,
  $properties: {
    category: { $type: String },
    hasVariants: { $type: Boolean },
    
    // Only required for clothing/electronics with variants
    variants: {
      $type: [String],
      $optional: true,
      $when: [{
        property: "category",
        condition: { 
          and: [
            { in: ["clothing", "electronics"] },
            { custom: (_, obj) => (obj as any).hasVariants === true }
          ]
        },
        then: { required: true }
      }]
    }
  }
} as const;
```

#### Available Conditions

- `{ equals: value }` - Exact equality
- `{ in: [value1, value2] }` - Value in array
- `{ not: condition }` - Negation
- `{ and: [condition1, condition2] }` - All conditions must match
- `{ or: [condition1, condition2] }` - Any condition must match
- `{ matches: /regex/ }` - Regex pattern matching (strings)
- `{ range: { min: 0, max: 100 } }` - Numeric range
- `{ exists: true }` - Property exists (not null/undefined)
- `{ custom: (value, fullObject) => boolean }` - Custom function

#### Available Actions

- `{ required: true/false }` - Make property required/optional
- `{ type: NewType }` - Change property type
- `{ constraints: [...] }` - Add additional constraints
- `{ limitTo: [values] }` - Restrict to specific values
- `{ schema: {...} }` - Replace entire property schema

## API

### Core Functions

- `configureMonoSchema(options?)` — Create a MonoSchema instance
- `validate(schema)` — Create a validation function for a schema

### Constraints

- `min(number)` / `max(number)`
- `minLength(number)` / `maxLength(number)`
- `regex(RegExp)`
- `email()`
- `url()`
- `ipv4()` / `ipv6()` / `cidrv4()` / `cidrv6()`
- `mac()`
- `uuid()` / `guid()`
- `hex()`
- `base64()`
- `instanceOf(constructor)`

### Schema Properties

- `$type` — The expected type (String, Number, Boolean, Date, Object, Array, or custom)
- `$optional` — Whether the property is optional
- `$constraints` — Array of constraint functions
- `$properties` — For Object types, nested property definitions
- `$when` — Conditional validation rules
- `$discriminant` — Discriminated union configuration

### Types

- `Constraint` — Interface for custom constraints
- `ConditionalRule` — Interface for conditional validation rules
- `ConditionalCondition` — Union of available condition types
- `ConditionalAction` — Union of available actions
- `DiscriminantConfig` — Configuration for discriminated unions
- `MonoSchemaPropertyPath` — Type for property paths
- `InferTypeFromMonoSchema` — Type inference for schemas

## License

MIT

## Related Packages

- [@voidhaus/monoschema-mongo](https://www.npmjs.com/package/@voidhaus/monoschema-mongo) - Type-safe MongoDB operations with schema validation.
- [@voidhaus/monoschema-transformer](https://www.npmjs.com/package/@voidhaus/monoschema-transformer) - Schema transformation utilities
