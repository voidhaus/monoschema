# monoschema

A minimal, type-safe schema validation library for TypeScript projects. Provides a set of composable constraints and utilities for validating data structures, with a focus on developer ergonomics and type inference.

## Features

- **Type-safe schema definitions**
- **Composable constraints** for numbers, strings, arrays, objects, and more
- **Built-in validators** for common formats (email, URL, IP, UUID, MAC, base64, etc.)
- **Custom constraint support**
- **Type inference** for validated data
- **Zero dependencies**

## Installation

```sh
pnpm add @voidhaus/monoschema
# or
yarn add @voidhaus/monoschema
# or
npm install @voidhaus/monoschema
```

## Usage


### Type Inference Example

```ts
import { configureMonoSchema, type InferTypeFromMonoSchema } from '@voidhaus/monoschema';
import { min, minLength, max, email } from '@voidhaus/monoschema/constraints';

// Gender enum type for type-safe inference
const GenderEnum = Object.assign(
  () => ({
    validate: (value: unknown) => ({
      valid: ["male", "female", "other"].includes(value as string),
      errors: [
        {
          path: '',
          message: 'Invalid gender',
          expected: 'male | female | other',
          received: typeof value,
          value,
        },
      ],
    }),
  }),
  { tsType: null as unknown as "male" | "female" | "other" }
);

const userSchema = {
  name: { $type: String, $constraints: [minLength(2)] },
  age: { $type: Number, $constraints: [min(1), max(120)] },
  email: { $type: String, $constraints: [email()], $optional: true },
  gender: { $type: GenderEnum },
} as const; // as const here improves type inference; not required but recommended

// Infer the TypeScript type from the schema
type User = InferTypeFromMonoSchema<typeof userSchema>;

// User is now:
// {
//   name: string;
//   age: number;
//   email: string | undefined;
//   gender: "male" | "female" | "other";
// }

const example: User = {
  name: 'Alice',
  age: 30,
  email: undefined,
  gender: 'female',
};
```

### Validating a Schema

```ts
import { configureMonoSchema, type InferTypeFromMonoSchema } from '@voidhaus/monoschema';
import { min, minLength, max, maxLength, email } from '@voidhaus/monoschema/constraints';

// Gender enum type for type-safe inference
const GenderEnum = Object.assign(
  ...
);

const userSchema = {
  name: { $type: String, $constraints: [minLength(2), maxLength(50)] },
  age: { $type: Number, $constraints: [min(0), max(120)] },
  email: { $type: String, $constraints: [email()] },
  gender: { $type: GenderEnum },
} as const;

// Infer the TypeScript type from the schema
type User = InferTypeFromMonoSchema<typeof userSchema>;

const validator = configureMonoSchema({
  plugins: [{
    name: "GenderPlugin",
    description: "Plugin for GenderEnum",
    version: "1.0.0",
    types: [GenderEnum],
  }],
});

// Validate an object
const example: User = {
  name: 'Alice',
  age: 30,
  email: undefined,
  gender: 'female',
};

const validate = validator.validate(userSchema);
const result = validate(example);
console.log(result.valid); // true
console.log(result.errors); // []

// Example with invalid data
const invalid: User = {
  name: 'A', // too short
  age: 200,  // too high
  email: 'not-an-email', // invalid email
  gender: 'unknown', // not in GenderEnum
};
const invalidResult = validate(invalid);
console.log(invalidResult.valid); // false
console.log(invalidResult.errors);
// Example error output:
// [
//   { path: 'name', message: 'String length 1 is less than minimum 2', ... },
//   { path: 'age', message: 'Value 200 is greater than maximum 120', ... },
//   { path: 'email', message: 'String not-an-email...', ... },
//   { path: 'gender', message: 'Invalid gender', ... }
//];
```

### Custom Constraints

```ts
import { Constraint } from '@voidhaus/monoschema/constraints';

const startsWithA: Constraint = {
  validate: (value) => typeof value === 'string' && value.startsWith('A'),
  message: (value) => `Value ${value} does not start with 'A'`,
};
```

## API

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

### Types

- `Constraint` — interface for custom constraints
- `MonoSchemaPropertyPath` — type for property paths
- `InferTypeFromMonoSchema` — type inference for schemas

## License

MIT
