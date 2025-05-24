import { InferTypeFromMonoSchema } from '@voidhaus/monoschema';
import { describe, it, expect } from 'vitest';

const testSchema = {
  $type: Object,
  $properties: {
    name: { $type: String },
    age: { $type: Number }, 
    address: {
      $type: Object, 
      $properties: {
        street: { $type: String },
        city: { $type: String },
        zip: { $type: String },
      },
    },
    location: {
      $type: Object,
      $properties: {
        type: { $type: String, $default: 'Point' },
        coordinates: { $type: Array, $items: Number },
      },
    },
  },
} as const
type TestSchemaType = InferTypeFromMonoSchema<typeof testSchema>;

describe('Query functions', () => {
  it('should give type inference using monoschema', () => {
    // This query should be valid with the TestSchemaType
    query<TestSchemaType>(
      eq('name', 'John'),
      gt('age', 30),
    )

    // This query should not be valid with the TestSchemaType
    // @ts-expect-error - 'location' is not a valid field in TestSchemaType
    query<TestSchemaType>(
      eq('location', 'some value'),
      gt('age', 30),
    )
  })

  it('should construct valid $eq query', () => {
    const expectedQuery = {
      name: { $eq: 'John' },
      age: { $eq: 30 },
    }
    // eq should be shorthand for equals
    const queryO = query<TestSchemaType>(
      eq('name', 'John'),
      equals('age', 30),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $ne query', () => {
    const expectedQuery = {
      name: { $ne: 'John' },
      age: { $ne: 30 },
    }
    // ne should be shorthand for notEquals
    const queryO = query<TestSchemaType>(
      ne('name', 'John'),
      notEquals('age', 30),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $in query', () => {
    const expectedQuery = {
      name: { $in: ['John', 'Jane'] },
      age: { $in: [30, 25] },
    }
    // in should be shorthand for inArray
    const queryO = query<TestSchemaType>(
      in('name', ['John', 'Jane']),
      inArray('age', [30, 25]),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $nin query', () => {
    const expectedQuery = {
      name: { $nin: ['John', 'Jane'] },
      age: { $nin: [30, 25] },
    }
    // nin should be shorthand for notInArray
    const queryO = query<TestSchemaType>(
      nin('name', ['John', 'Jane']),
      notInArray('age', [30, 25]),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $gt query', () => {
    const expectedQuery = {
      age: { $gt: 30 },
    }
    // gt should be shorthand for greaterThan
    const queryO = query<TestSchemaType>(
      gt('age', 30),
      greaterThan('age', 30),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $gte query', () => {
    const expectedQuery = {
      age: { $gte: 30 },
    }
    // gte should be shorthand for greaterThanOrEqual
    const queryO = query<TestSchemaType>(
      gte('age', 30),
      greaterThanOrEqual('age', 30),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $lt query', () => {
    const expectedQuery = {
      age: { $lt: 30 },
    }
    // lt should be shorthand for lessThan
    const queryO = query<TestSchemaType>(
      lt('age', 30),
      lessThan('age', 30),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $lte query', () => {
    const expectedQuery = {
      age: { $lte: 30 },
    }
    // lte should be shorthand for lessThanOrEqual
    const queryO = query<TestSchemaType>(
      lte('age', 30),
      lessThanOrEqual('age', 30),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $exists and $notExists query', () => {
    const expectedQuery = {
      name: { $exists: true },
      age: { $exists: false },
    }
    // exists should be shorthand for fieldExists
    const queryO = query<TestSchemaType>(
      exists('name'),
      fieldExists('name'),
      notExists('age'),
      fieldNotExists('age'),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $regex query', () => {
    const expectedQuery = {
      name: { $regex: '^John', $options: 'i' },
    }
    // regex should be shorthand for matchesRegex
    const queryO = query<TestSchemaType>(
      regex('name', '^John', 'i'),
      matchesRegex('name', '^John', 'i'),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $and query', () => {
    const expectedQuery = {
      $and: [
        { name: { $eq: 'John' } },
        { age: { $gt: 30 } },
      ],
    }
    // and should be shorthand for combineWithAnd
    const queryO = query<TestSchemaType>(
      and(
        eq('name', 'John'),
        gt('age', 30),
      ),
      combineWithAnd(
        eq('name', 'John'),
        gt('age', 30),
      ),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $or query', () => {
    const expectedQuery = {
      $or: [
        { name: { $eq: 'John' } },
        { age: { $gt: 30 } },
      ],
    }
    // or should be shorthand for combineWithOr
    const queryO = query<TestSchemaType>(
      or(
        eq('name', 'John'),
        gt('age', 30),
      ),
      combineWithOr(
        eq('name', 'John'),
        gt('age', 30),
      ),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $nor query', () => {
    const expectedQuery = {
      $nor: [
        { name: { $eq: 'John' } },
        { age: { $gt: 30 } },
      ],
    }
    // nor should be shorthand for combineWithNor
    const queryO = query<TestSchemaType>(
      nor(
        eq('name', 'John'),
        gt('age', 30),
      ),
      combineWithNor(
        eq('name', 'John'),
        gt('age', 30),
      ),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  
  it('should construct valid $text query', () => {
    const expectedQuery = {
      $text: { $search: 'John Doe' },
    }
    // text should be shorthand for textSearch
    const queryO = query<TestSchemaType>(
      text('John Doe'),
      textSearch('John Doe'),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $geoWithin query', () => {
    const expectedQuery = {
      location: {
        $geoWithin: {
          $geometry: {
            type: 'Polygon',
            coordinates: [
              [[-10, -10], [-10, 10], [10, 10], [10, -10], [-10, -10]],
            ],
          },
        },
      },
    }
    // geoWithin should be shorthand for geoWithinPolygon
    const queryO = query<TestSchemaType>(
      geoWithinPolygon('location', [[-10, -10], [-10, 10], [10, 10], [10, -10], [-10, -10]]),
      geoWithin('location', [[-10, -10], [-10, 10], [10, 10], [10, -10], [-10, -10]]),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $geoIntersects query', () => {
    const expectedQuery = {
      location: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [0, 0],
          },
        },
      },
    }
    // geoIntersects should be shorthand for geoIntersectsPoint
    const queryO = query<TestSchemaType>(
      geoIntersectsPoint('location', [0, 0]),
      geoIntersects('location', { type: 'Point', coordinates: [0, 0] }),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should construct valid $near query', () => {
    const expectedQuery = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [0, 0],
          },
          $maxDistance: 1000,
        },
      },
    }
    // near should be shorthand for geoNearPoint
    const queryO = query<TestSchemaType>(
      nearPoint('location', [0, 0], 1000),
      geoNear('location', { type: 'Point', coordinates: [0, 0] }, 1000),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should accept multiple conditions on the same field', () => {
    const expectedQuery = {
      name: { $eq: 'John', $ne: 'Doe' },
      age: { $gt: 30, $lt: 40 },
    }
    // Multiple conditions on the same field
    const queryO = query<TestSchemaType>(
      eq('name', 'John'),
      ne('name', 'Doe'),
      gt('age', 30),
      lt('age', 40),
    )
    const queryObject = queryO.toMongo()

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should handle empty queries', () => {
    const queryO = query<TestSchemaType>();
    const queryObject = queryO.toMongo();

    expect(queryObject).toEqual({});
  })

  it('should combine multiple queries of the same type in the same block scope', () => {
    const expectedQuery = {
      name: { $eq: 'John' },
      $and: [
        { age: { $gt: 30 } },
        { age: { $lt: 40 } },
      ],
    }
    // Combine multiple queries of the same type
    const queryO = query<TestSchemaType>(
      gt('age', 30),
      eq('name', 'John'),
      lt('age', 40),
    )
    const queryObject = queryO.toMongo();

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should not combine queries of the same type across different block scopes', () => {
    const expectedQuery = {
      $or: [
        { age: { $gt: 40 } },
        { age: { $lt: 30 } },
      ],
      $and: [
        { age: { $gt: 30 } },
        { age: { $lt: 40 } },
        { name: { $eq: 'John' } },
      ],
    }
    // Different block scopes should not combine
    const queryO = query<TestSchemaType>(
      or(
        gt('age', 40),
        lt('age', 30),
      ),
      and(
        gt('age', 30),
        lt('age', 40),
        eq('name', 'John'),
      ),
    )
    const queryObject = queryO.toMongo();

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should handle nested queries', () => {
    const expectedQuery = {
      $and: [
        { name: { $eq: 'John' } },
        {
          $or: [
            { age: { $gt: 30 } },
            { age: { $lt: 20 } },
          ],
        },
      ],
    }
    // Nested queries
    const queryO = query<TestSchemaType>(
      and(
        eq('name', 'John'),
        or(
          gt('age', 30),
          lt('age', 20),
        ),
      ),
    )
    const queryObject = queryO.toMongo();

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should handle complex queries with multiple conditions', () => {
    const expectedQuery = {
      $and: [
        { name: { $eq: 'John' } },
        { age: { $gt: 30 } },
        {
          $or: [
            { age: { $lt: 40 } },
            { age: { $gte: 50 } },
          ],
        },
      ],
    }
    // Complex queries with multiple conditions
    const queryO = query<TestSchemaType>(
      and(
        eq('name', 'John'),
        gt('age', 30),
        or(
          lt('age', 40),
          gte('age', 50),
        ),
      ),
    )
    const queryObject = queryO.toMongo();

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should handle dot notation for nested fields', () => {
    const expectedQuery = {
      'address.street': { $eq: 'Main St' },
      'address.city': { $ne: 'New York' },
    }
    // Dot notation for nested fields
    const queryO = query<TestSchemaType>(
      eq('address.street', 'Main St'),
      ne('address.city', 'New York'),
    )
    const queryObject = queryO.toMongo();

    expect(queryObject).toEqual(expectedQuery);
  })

  it('should handle array fields with $elemMatch', () => {
    const expectedQuery = {
      location: {
        $elemMatch: {
          type: { $eq: 'Point' },
          coordinates: { $eq: [0, 0] },
        },
      },
    }
    // Array fields with $elemMatch
    const queryO = query<TestSchemaType>(
      elemMatch('location', { type: 'Point', coordinates: [0, 0] }),
    )
    const queryObject = queryO.toMongo();

    expect(queryObject).toEqual(expectedQuery);
  })
})