# Monoschema

A comprehensive TypeScript-first schema validation ecosystem that provides type-safe data validation, transformation, and MongoDB integration.

## Overview

Monoschema is a minimal yet powerful schema validation library designed for TypeScript projects. It offers a composable approach to data validation with excellent type inference, zero dependencies, and a growing ecosystem of extensions.

## Packages

This monorepo contains the following packages:

### 🔧 [@voidhaus/monoschema](./packages/monoschema)

The core schema validation library that provides:

- **Type-safe schema definitions** with full TypeScript inference
- **Composable constraints** for all primitive and complex types
- **Built-in validators** for common formats (email, URL, UUID, etc.)
- **Conditional validation** with `$when` rules
- **Custom constraint support**
- **Zero dependencies**

**Perfect for:** Basic schema validation, form validation, API request/response validation

[📖 Read the full documentation →](./packages/monoschema/README.md)

### 🍃 [@voidhaus/monoschema-mongo](./packages/monoschema-mongo)

MongoDB extension that adds:

- **Type-safe MongoDB queries** with full type inference
- **MongoDB-specific types** (ObjectId support with automatic transformations)
- **Schema-aware MongoDB client wrapper**
- **Composable query builders** for complex MongoDB operations
- **Type-safe update operations**

**Perfect for:** MongoDB applications, type-safe database operations, complex queries

[📖 Read the full documentation →](./packages/monoschema-mongo/README.md)

### 🔄 [@voidhaus/monoschema-transformer](./packages/monoschema-transformer)

Data transformation plugin that enables:

- **Pre-validation data transformation** (strings to numbers, dates, booleans)
- **Built-in transformers** for common type conversions
- **Custom transformer support**
- **Composable transformations** with error handling
- **Type-safe transformations** with proper type inference

**Perfect for:** API data processing, form data conversion, data normalization

[📖 Read the full documentation →](./packages/monoschema-transformer/README.md)

## Quick Start

### Basic Usage

```typescript
import { configureMonoSchema, type InferTypeFromMonoSchema } from '@voidhaus/monoschema';
import { min, email } from '@voidhaus/monoschema/constraints';

const userSchema = {
  $type: Object,
  $properties: {
    name: { $type: String },
    age: { $type: Number, $constraints: [min(18)] },
    email: { $type: String, $constraints: [email()] }
  }
} as const;

type User = InferTypeFromMonoSchema<typeof userSchema>;
// Result: { name: string; age: number; email: string }

const monoSchema = configureMonoSchema();
const validate = monoSchema.validate(userSchema);

const result = validate({
  name: "John Doe",
  age: 25,
  email: "john@example.com"
});
```

### With MongoDB

```typescript
import { configureMonoSchema } from '@voidhaus/monoschema';
import { MongoTypesPlugin, MongoTransformersPlugin, ObjectID } from '@voidhaus/monoschema-mongo';

const monoSchema = configureMonoSchema({
  plugins: [MongoTypesPlugin, MongoTransformersPlugin]
});

const userSchema = {
  $type: Object,
  $properties: {
    _id: { $type: ObjectID },
    name: { $type: String },
    email: { $type: String, $constraints: [email()] }
  }
} as const;
```

### With Transformations

```typescript
import { configureMonoSchema } from '@voidhaus/monoschema';
import { transformerPlugin, stringToNumber } from '@voidhaus/monoschema-transformer';

const monoSchema = configureMonoSchema({
  plugins: [transformerPlugin]
});

const schema = {
  $type: Object,
  $properties: {
    age: { 
      $type: Number, 
      $transformers: [stringToNumber()],
      $constraints: [min(18)]
    }
  }
} as const;

// "25" will be transformed to 25 before validation
const result = validate({ age: "25" });
```

## Installation

### Core Package

```bash
npm install @voidhaus/monoschema
# or
yarn add @voidhaus/monoschema
# or
pnpm add @voidhaus/monoschema
```

### Extensions

```bash
# MongoDB support
npm install @voidhaus/monoschema-mongo

# Data transformation
npm install @voidhaus/monoschema-transformer
```

## Key Features

- **🔒 Type Safety**: Full TypeScript support with automatic type inference
- **🧩 Composable**: Mix and match constraints, transformers, and plugins
- **⚡ Performance**: Minimal overhead with zero core dependencies
- **🔧 Extensible**: Plugin system for custom functionality
- **📝 Developer Experience**: Excellent error messages and IDE support
- **🌐 Ecosystem**: Growing collection of plugins and integrations

## Development

This project uses:

- **pnpm** for package management
- **Turborepo** for monorepo management
- **TypeScript** for type safety
- **Changesets** for versioning and publishing

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build all packages
pnpm build

# Lint code
pnpm lint
```

## Contributing

We welcome contributions! Please read our contributing guidelines and feel free to submit issues and pull requests.

## License

MIT © Voidhaus
