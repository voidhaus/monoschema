# @voidhaus/monoschema-transformer

A data transformation plugin for [monoschema](https://www.npmjs.com/package/@voidhaus/monoschema) that allows you to transform data before validation. Transform strings to numbers, dates, booleans and more with type-safe transformers.

## Features

- **Pre-validation data transformation** - Transform data before schema validation
- **Built-in transformers** for common type conversions
- **Custom transformer support** - Create your own transformers
- **Type-safe** - Full TypeScript support with proper type inference
- **Composable** - Chain multiple transformers together
- **Error handling** - Clear error messages with path information

## Installation

```bash
npm install @voidhaus/monoschema-transformer
# or
yarn add @voidhaus/monoschema-transformer
# or
pnpm add @voidhaus/monoschema-transformer
```

**Note:** This package requires `@voidhaus/monoschema` as a peer dependency.

## Quick Start

```typescript
import { createSchema } from '@voidhaus/monoschema';
import { transformerPlugin, stringToNumber, stringToBoolean } from '@voidhaus/monoschema-transformer';

// Configure monoschema with the transformer plugin
const schema = createSchema({
  plugins: [transformerPlugin]
});

// Define a schema with transformers
const userSchema = schema.object({
  name: schema.string(),
  age: schema.number({
    $transformers: [stringToNumber()]
  }),
  isActive: schema.boolean({
    $transformers: [stringToBoolean()]
  })
});

// Transform and validate data
const result = userSchema.validate({
  name: "John Doe",
  age: "25",        // Will be transformed to number 25
  isActive: "true"  // Will be transformed to boolean true
});

console.log(result); 
// { name: "John Doe", age: 25, isActive: true }
```

## Built-in Transformers

### String Transformers

#### `stringToNumber()`
Converts string values to numbers.

```typescript
const schema = createSchema({ plugins: [transformerPlugin] });
const numberSchema = schema.number({
  $transformers: [stringToNumber()]
});

numberSchema.validate("123");    // → 123
numberSchema.validate("123.45"); // → 123.45
numberSchema.validate("1e3");    // → 1000
// numberSchema.validate("abc");    // → throws error
```

#### `stringToBoolean()`
Converts string values to booleans (case-insensitive).

```typescript
const boolSchema = schema.boolean({
  $transformers: [stringToBoolean()]
});

boolSchema.validate("true");  // → true
boolSchema.validate("TRUE");  // → true
boolSchema.validate("false"); // → false
boolSchema.validate("FALSE"); // → false
// boolSchema.validate("yes");   // → throws error
```

#### `stringToDate()`
Converts string values to Date objects.

```typescript
const dateSchema = schema.custom<Date>({
  $transformers: [stringToDate()]
});

dateSchema.validate("2023-12-25T10:30:00.000Z"); // → Date object
dateSchema.validate("2023-12-25");               // → Date object
// dateSchema.validate("invalid-date");            // → throws error
```

### Type to String Transformers

#### `numberToString()`
Converts numbers to strings.

```typescript
const stringSchema = schema.string({
  $transformers: [numberToString()]
});

stringSchema.validate(123);   // → "123"
stringSchema.validate(123.45); // → "123.45"
```

#### `booleanToString()`
Converts booleans to strings.

```typescript
const stringSchema = schema.string({
  $transformers: [booleanToString()]
});

stringSchema.validate(true);  // → "true"
stringSchema.validate(false); // → "false"
```

#### `dateToString()`
Converts Date objects to ISO strings.

```typescript
const stringSchema = schema.string({
  $transformers: [dateToString()]
});

stringSchema.validate(new Date("2023-12-25")); // → "2023-12-25T00:00:00.000Z"
```

## Chaining Transformers

You can chain multiple transformers together by providing them in an array:

```typescript
const customSchema = schema.string({
  $transformers: [
    stringToNumber(),    // First: string → number
    numberToString()     // Then: number → string
  ]
});

customSchema.validate("123"); // → "123" (string → number → string)
```

## Custom Transformers

Create your own transformers by implementing the `Transformer` interface:

```typescript
import type { Transformer } from '@voidhaus/monoschema-transformer';

const trimString = (): Transformer => ({
  input: String,
  output: String,
  transform: (value: string): string => {
    return value.trim();
  }
});

const upperCaseString = (): Transformer => ({
  input: String,
  output: String,
  transform: (value: string): string => {
    return value.toUpperCase();
  }
});

// Use custom transformers
const nameSchema = schema.string({
  $transformers: [trimString(), upperCaseString()]
});

nameSchema.validate("  john doe  "); // → "JOHN DOE"
```

## Error Handling

Transformers provide clear error messages with path information:

```typescript
const userSchema = schema.object({
  profile: schema.object({
    age: schema.number({
      $transformers: [stringToNumber()]
    })
  })
});

try {
  userSchema.validate({
    profile: {
      age: "not-a-number"
    }
  });
} catch (error) {
  console.log(error.message); 
  // "profile.age: Cannot convert "not-a-number" to a number"
}
```

## API Reference

### Plugin

#### `transformerPlugin`
The main plugin to register with monoschema. Add this to your schema configuration to enable transformer support.

### Types

#### `Transformer`
```typescript
type TransformerObject = {
  input: any;
  output: any;
  transform: (value: any) => any;
};

type Transformer = () => TransformerObject;
```

#### `$transformers` Schema Property
Add transformers to any schema using the `$transformers` property:

```typescript
const schema = {
  // ... other schema properties
  $transformers: [transformer1(), transformer2(), ...]
}
```

## Integration with monoschema

This package is designed to work seamlessly with the monoschema ecosystem:

- **[monoschema](https://www.npmjs.com/package/@voidhaus/monoschema)** - Core schema validation library
- **[monoschema-mongo](https://www.npmjs.com/package/@voidhaus/monoschema-mongo)** - MongoDB integration for monoschema

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License. See LICENSE file for details.