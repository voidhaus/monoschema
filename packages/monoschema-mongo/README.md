# @voidhaus/monoschema-mongo

MongoDB extension for [@voidhaus/monoschema](https://www.npmjs.com/package/@voidhaus/monoschema) that provides type-safe MongoDB operations with schema validation.

## Features

- **Type-safe MongoDB queries** with full type inference
- **MongoDB-specific types** (ObjectId support)
- **Automatic string to ObjectId transformation**
- **Type-safe update operations**
- **Schema-aware MongoDB client wrapper**
- **Composable query builders** for complex MongoDB queries
- **Full TypeScript integration** with monoschema type inference

## Installation

```bash
npm install @voidhaus/monoschema-mongo
# or
yarn add @voidhaus/monoschema-mongo
# or
pnpm add @voidhaus/monoschema-mongo
```

**Note:** This package requires `@voidhaus/monoschema` and `mongodb` as peer dependencies.

## Quick Start

### Basic Setup

```typescript
import { configureMonoSchema, type InferTypeFromMonoSchema } from '@voidhaus/monoschema';
import { MongoClient } from 'mongodb';
import { 
  MongoTypesPlugin, 
  MongoTransformersPlugin, 
  ObjectID,
  MonoSchemaMongoClient,
  query,
  update,
  eq, gt, set, inc
} from '@voidhaus/monoschema-mongo';

// Configure monoschema with MongoDB plugins
const monoSchema = configureMonoSchema({
  plugins: [MongoTypesPlugin, MongoTransformersPlugin]
});

// Define your schema
const userSchema = {
  $type: Object,
  $properties: {
    _id: { $type: ObjectID },
    name: { $type: String },
    email: { $type: String },
    age: { $type: Number },
    createdAt: { $type: Date }
  }
} as const;

type User = InferTypeFromMonoSchema<typeof userSchema>;

// Setup MongoDB client
const client = new MongoClient('mongodb://localhost:27017');
const mongoClient = new MonoSchemaMongoClient(client);
```

### Type-Safe Queries

```typescript
// Build type-safe queries
const userQuery = query<User>(
  eq('name', 'John Doe'),
  gt('age', 25)
);

// Find users with type safety
const users = await mongoClient.find<User>('users', userQuery);

// Find single user
const user = await mongoClient.findOne<User>('users', 
  query<User>(eq('email', 'john@example.com'))
);
```

### MongoDB Operations

```typescript
// Insert with validation
const newUser = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  age: 28,
  createdAt: new Date()
};

const insertResult = await mongoClient.insertOne<User>('users', newUser);

// Bulk insert
const users = [newUser, /* ... more users */];
const bulkResult = await mongoClient.insertMany<User>('users', users);
```

### Type-Safe Updates

```typescript
// Build type-safe update operations
const userUpdate = update<User>(
  set('name', 'John Smith'),
  inc('age', 1)
);

// Use with native MongoDB operations
const collection = client.db('mydb').collection<User & Document>('users');
await collection.updateOne(
  userQuery.toMongo(),
  userUpdate.toMongo()
);
```

## API Reference

### Plugins

#### MongoTypesPlugin
Provides MongoDB-specific types for monoschema.

```typescript
import { MongoTypesPlugin, ObjectID } from '@voidhaus/monoschema-mongo';

const schema = {
  $type: Object,
  $properties: {
    _id: { $type: ObjectID }
  }
} as const;
```

#### MongoTransformersPlugin
Automatically transforms string values to ObjectId when needed.

```typescript
// This will automatically convert string IDs to ObjectId instances
const data = { _id: '507f1f77bcf86cd799439011' }; // string
// After validation: { _id: ObjectId('507f1f77bcf86cd799439011') }
```

### Query Builder

Build complex, type-safe MongoDB queries:

```typescript
import { query, eq, ne, gt, gte, lt, lte, inArray, nin, exists, regex, and, or } from '@voidhaus/monoschema-mongo';

// Comparison operators
query<User>(
  eq('name', 'John'),           // { name: { $eq: 'John' } }
  ne('status', 'inactive'),     // { status: { $ne: 'inactive' } }
  gt('age', 18),                // { age: { $gt: 18 } }
  gte('score', 80),             // { score: { $gte: 80 } }
  lt('createdAt', new Date()),  // { createdAt: { $lt: date } }
  lte('count', 100)             // { count: { $lte: 100 } }
);

// Array operators
query<User>(
  inArray('role', ['admin', 'user']),    // { role: { $in: ['admin', 'user'] } }
  nin('status', ['banned', 'suspended']) // { status: { $nin: ['banned', 'suspended'] } }
);

// Field existence
query<User>(
  exists('email'),        // { email: { $exists: true } }
  notExists('deletedAt')  // { deletedAt: { $exists: false } }
);

// Text and regex
query<User>(
  regex('name', /^John/i),                    // { name: { $regex: /^John/i } }
  text('search terms')                        // { $text: { $search: 'search terms' } }
);

// Logical operators
query<User>(
  and(
    eq('status', 'active'),
    gt('age', 18)
  ),
  or(
    eq('role', 'admin'),
    gt('score', 90)
  )
);

// Geospatial queries
query<Location>(
  geoWithin('location', coordinates),
  geoIntersects('area', geometry),
  nearPoint('position', [lng, lat], maxDistance)
);
```

### Update Builder

Build type-safe update operations:

```typescript
import { update, set, inc } from '@voidhaus/monoschema-mongo';

// Update operations
const userUpdate = update<User>(
  set('name', 'New Name'),      // { $set: { name: 'New Name' } }
  set('email', 'new@email.com'),
  inc('loginCount', 1),         // { $inc: { loginCount: 1 } }
  set('lastLogin', new Date())
);

// Nested field updates
update<User>(
  set('profile.bio', 'Updated bio'),
  set('settings.theme', 'dark')
);
```

### MonoSchemaMongoClient

A wrapper around MongoDB client with schema validation:

```typescript
class MonoSchemaMongoClient {
  // Find multiple documents
  async find<T>(
    collectionName: string,
    query: QueryBuilder<T>,
    options?: FindOptions
  ): Promise<WithId<T & Document>[]>

  // Find single document
  async findOne<T>(
    collectionName: string,
    query: QueryBuilder<T>,
    options?: FindOptions
  ): Promise<WithId<T & Document> | null>

  // Insert single document
  async insertOne<T>(
    collectionName: string,
    document: OptionalUnlessRequiredId<T & Document>,
    options?: InsertOneOptions
  ): Promise<InsertOneResult<T>>

  // Insert multiple documents
  async insertMany<T>(
    collectionName: string,
    documents: OptionalUnlessRequiredId<T & Document>[],
    options?: BulkWriteOptions
  ): Promise<InsertManyResult<T & Document>>
}
```

## Advanced Usage

### Complex Queries with Nested Logic

```typescript
const complexQuery = query<User>(
  and(
    eq('status', 'active'),
    or(
      and(
        eq('role', 'premium'),
        gt('subscription.expiresAt', new Date())
      ),
      eq('role', 'admin')
    ),
    exists('email')
  ),
  regex('name', /^[A-Z]/), // Names starting with capital letter
  gte('createdAt', lastWeek)
);
```

### Using with Aggregation Pipeline

```typescript
// Use query builder results in aggregation
const matchStage = {
  $match: query<User>(
    eq('status', 'active'),
    gt('age', 18)
  ).toMongo()
};

const pipeline = [
  matchStage,
  { $group: { _id: '$department', count: { $sum: 1 } } }
];

const results = await collection.aggregate(pipeline).toArray();
```

### Custom Schema Validation with MongoDB

```typescript
import { minLength, email } from '@voidhaus/monoschema/constraints';

const userSchema = {
  $type: Object,
  $properties: {
    _id: { $type: ObjectID },
    name: { $type: String, $constraints: [minLength(2)] },
    email: { $type: String, $constraints: [email()] },
    age: { $type: Number, $constraints: [min(18), max(120)] }
  }
} as const;

// Validate before inserting
const validate = monoSchema.validate(userSchema);
const userData = { name: 'John', email: 'john@example.com', age: 25 };

const validationResult = await validate(userData);
if (validationResult.valid) {
  await mongoClient.insertOne<User>('users', validationResult.data);
} else {
  console.error('Validation errors:', validationResult.errors);
}
```

## Type Safety

The package provides full type safety throughout:

```typescript
// ✅ Valid - correct types
query<User>(
  eq('name', 'John'),        // string field expects string
  gt('age', 25),             // number field expects number
  eq('_id', new ObjectId())  // ObjectId field expects ObjectId
);

// ❌ TypeScript errors - incorrect types
query<User>(
  eq('name', 123),           // Error: number not assignable to string
  gt('age', '25'),           // Error: string not assignable to number
  eq('nonexistent', 'value') // Error: property doesn't exist in schema
);
```

## License

MIT

## Related Packages

- [@voidhaus/monoschema](https://www.npmjs.com/package/@voidhaus/monoschema) - Core schema validation library
- [@voidhaus/monoschema-transformer](https://www.npmjs.com/package/@voidhaus/monoschema-transformer) - Schema transformation utilities