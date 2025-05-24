import { describe, it, expect } from 'vitest';

import { update, set, inc } from './update';
import { InferTypeFromMonoSchema } from '@voidhaus/monoschema';

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
        type: { $type: String },
        coordinates: { $type: [Number] },
      },
    },
  },
} as const
type TestSchemaType = InferTypeFromMonoSchema<typeof testSchema>;

describe('Update functions', () => {
  it('should give type inference using monoschema', () => {
    update<TestSchemaType>(
      set('name', 'John Doe'),
      set('age', 30),
      set('address.street', '123 Main St'),
      set('address.city', 'Anytown'),
    )

    update<TestSchemaType>(
      // @ts-expect-error
      set('gender', 'Prefer not to say'), // This should cause a type error
    )
  })

  it('should set a simple field', () => {
    const expectedUpdate = { $set: { name: 'John Doe' } };
    const updateO = update<TestSchemaType>(
      set('name', 'John Doe'),
    )
    const updateObject = updateO.toMongo()
    expect(updateObject).toEqual(expectedUpdate);
  })

  it('should set a nested field', () => {
    const expectedUpdate = { $set: { 'address.street': '123 Main St' } };
    const updateO = update<TestSchemaType>(
      set('address.street', '123 Main St'),
    )
    const updateObject = updateO.toMongo()
    expect(updateObject).toEqual(expectedUpdate);
  })

  it('should set multiple fields', () => {
    const expectedUpdate = {
      $set: {
        name: 'John Doe',
        age: 30,
        'address.street': '123 Main St',
        'address.city': 'Anytown',
      },
    };
    const updateO = update<TestSchemaType>(
      set('name', 'John Doe'),
      set('age', 30),
      set('address.street', '123 Main St'),
      set('address.city', 'Anytown'),
    )
    const updateObject = updateO.toMongo()
    expect(updateObject).toEqual(expectedUpdate);
  })

  it('should increment a field', () => {
    const expectedUpdate = { $inc: { age: 1 } };
    const updateO = update<TestSchemaType>(
      inc('age', 1),
    )
    const updateObject = updateO.toMongo()
    expect(updateObject).toEqual(expectedUpdate);
  })

  it('should set a field to null', () => {
    const expectedUpdate = { $set: { name: null } };
    const updateO = update<TestSchemaType>(
      set('name', null),
    )
    const updateObject = updateO.toMongo()
    expect(updateObject).toEqual(expectedUpdate);
  })
})