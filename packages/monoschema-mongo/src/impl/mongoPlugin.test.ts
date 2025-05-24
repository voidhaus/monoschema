import { describe, it, expect } from 'vitest';
import { mongoTypesPlugin, mongoTransformersPlugin, ObjectID } from './mongoPlugin'
import { ObjectId } from 'mongodb'
import { configureMonoSchema, InferTypeFromMonoSchema } from '@voidhaus/monoschema'

describe('mongoTypesPlugin', () => {
  it('should validate ObjectId correctly in a schema', () => {
    const monoSchema = configureMonoSchema({ plugins: [mongoTypesPlugin] })
    const schema = {
      $type: Object,
      $properties: {
        _id: { $type: ObjectID },
        name: { $type: String },
      },
    } as const
    type MySchemaType = InferTypeFromMonoSchema<typeof schema>
    const validData: MySchemaType = { _id: new ObjectId(), name: 'foo' }
    const invalidData = { _id: 'not-an-objectid', name: 'foo' }
    const validate = monoSchema.validate(schema)
    expect(validate(validData)).toStrictEqual({ valid: true, errors: [], data: validData })
    const result = validate(invalidData)
    expect(result.valid).toBe(false)
    expect(result.errors[0]!.message).toMatch(/Invalid ObjectId/)
  })
})

describe('mongoTransformersPlugin', () => {
  it('should prevalidate and transform string to ObjectId', () => {
    const monoSchema = configureMonoSchema({ plugins: [mongoTransformersPlugin, mongoTypesPlugin] })
    const schema = {
      $type: Object,
      $properties: {
        _id: { $type: ObjectID },
        name: { $type: String },
      },
    } as const
    const validString = new ObjectId().toHexString()
    const data = { _id: validString, name: 'foo' }
    const validate = monoSchema.validate(schema)
    const result = validate(data)
    expect(result.valid).toBe(true)
    expect(result.data?._id).toBeInstanceOf(ObjectId)
    expect(result.data?._id.toHexString()).toBe(validString)
  })

  it('should fail on invalid ObjectId string', () => {
    const monoSchema = configureMonoSchema({ plugins: [mongoTypesPlugin, mongoTransformersPlugin] })
    const schema = {
      $type: Object,
      $properties: {
        _id: { $type: ObjectID },
        name: { $type: String },
      },
    } as const
    const data = { _id: 'invalid-objectid', name: 'foo' }
    const validate = monoSchema.validate(schema)
    const result = validate(data)
    expect(result.valid).toBe(false)
    expect(result.errors[0]!.message).toMatch(/Invalid ObjectId/)
  })

  it('should not transform if not a string', () => {
    const monoSchema = configureMonoSchema({ plugins: [mongoTypesPlugin, mongoTransformersPlugin] })
    const schema = {
      $type: Object,
      $properties: {
        _id: { $type: ObjectID },
        name: { $type: String },
      },
    } as const
    const data = { _id: new ObjectId(), name: 'foo' }
    const validate = monoSchema.validate(schema)
    const result = validate(data)
    expect(result.valid).toBe(true)
    expect(result.data?._id).toBeInstanceOf(ObjectId)
  })
})
