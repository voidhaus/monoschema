import { describe, it, expect } from 'vitest';
import { MongoTypesPlugin, MongoTransformersPlugin, ObjectID } from './mongoPlugin'
import { ObjectId } from 'mongodb'
import { configureMonoSchema, InferTypeFromMonoSchema } from '@voidhaus/monoschema'

describe('mongoTypesPlugin', () => {
  it('should validate ObjectId correctly in a schema', async () => {
    const monoSchema = configureMonoSchema({ plugins: [MongoTypesPlugin] })
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
    expect(await validate(validData)).toStrictEqual({ valid: true, errors: [], data: validData })
    const result = await validate(invalidData)
    expect(result.valid).toBe(false)
    expect(result.errors[0]!.message).toMatch(/Invalid ObjectId/)
  })
})

describe('mongoTransformersPlugin', () => {
  it('should prevalidate and transform string to ObjectId', async () => {
    const monoSchema = configureMonoSchema({ plugins: [MongoTransformersPlugin, MongoTypesPlugin] })
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
    const result = await validate(data)
    expect(result.valid).toBe(true)
    expect(result.data?._id).toBeInstanceOf(ObjectId)
    expect(result.data?._id.toHexString()).toBe(validString)
  })

  it('should fail on invalid ObjectId string', async () => {
    const monoSchema = configureMonoSchema({ plugins: [MongoTypesPlugin, MongoTransformersPlugin] })
    const schema = {
      $type: Object,
      $properties: {
        _id: { $type: ObjectID },
        name: { $type: String },
      },
    } as const
    const data = { _id: 'invalid-objectid', name: 'foo' }
    const validate = monoSchema.validate(schema)
    const result = await validate(data)
    expect(result.valid).toBe(false)
    expect(result.errors[0]!.message).toMatch(/Invalid ObjectId/)
  })

  it('should not transform if not a string', async () => {
    const monoSchema = configureMonoSchema({ plugins: [MongoTypesPlugin, MongoTransformersPlugin] })
    const schema = {
      $type: Object,
      $properties: {
        _id: { $type: ObjectID },
        name: { $type: String },
      },
    } as const
    const data = { _id: new ObjectId(), name: 'foo' }
    const validate = monoSchema.validate(schema)
    const result = await validate(data)
    expect(result.valid).toBe(true)
    expect(result.data?._id).toBeInstanceOf(ObjectId)
  })
})
