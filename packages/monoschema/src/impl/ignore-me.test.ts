import { describe, it, expect } from "vitest";
import { configureMonoSchema } from "./monoschema";
import { S } from "vitest/dist/chunks/config.d.UqE-KR0o.js";

describe('monoschema', () => {
  it('should allow creating a schema', () => {
    const monoSchema = configureMonoSchema()
    type MonoSchema = typeof monoSchema
    const basicSchema: MonoSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number, $optional: true },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
      },
    }
    // MonoSchema type should be inferred correctly
    const validData = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "gaming"],
    }
    const validOptionalData = {
      name: "John Doe",
      isActive: true,
      hobbies: ["reading", "gaming"],
    }
    const invalidData = {
      name: "John Doe",
      age: "thirty", // Invalid type
      isActive: true,
      hobbies: ["reading", "gaming"],
    }
    // Validate the data against the schema
    const validate = monoSchema.validate(basicSchema)
    const isValid = validate(validData)
    const isValidOptional = validate(validOptionalData)
    const isInvalid = validate(invalidData)
    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [] })
    expect(isValidOptional).toStrictEqual({ valid: true, errors: [] })
    expect(isInvalid).toStrictEqual({
      valid: false,
      errors: [
        {
          path: 'age',
          message: 'Expected type Number, but received String',
          expected: 'Number',
          received: 'String',
          value: 'thirty',
        },
      ],
    })
  })

  it('should allow creating a schema with nested objects', () => {
    const monoSchema = configureMonoSchema()
    type MonoSchema = typeof monoSchema
    const nestedSchema: MonoSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number },
        address: {
          $type: Object,
          $properties: {
            street: { $type: String },
            city: { $type: String },
            zipCode: { $type: Number },
          },
        },
      },
    }
    // MonoSchema type should be inferred correctly
    const validData = {
      name: "John Doe",
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: 10001,
      },
    }
    const invalidData = {
      name: "John Doe",
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: "10001", // Invalid type
      },
    }
    // Validate the data against the schema
    const validate = monoSchema.validate(nestedSchema)
    const isValid = validate(validData)
    const isInvalid = validate(invalidData)
    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [] })
    expect(isInvalid).toStrictEqual({
      valid: false,
      errors: [
        {
          path: 'address.zipCode',
          message: 'Expected type Number, but received String',
          expected: 'Number',
          received: 'String',
          value: '10001',
        },
      ],
    })
  })

  it('should allow extension of schemas', () => {
    const MyEnum = () => {
      const validValues = ["value1", "value2", "value3"]

      const validate = (value: unknown) => {
        if (!validValues.includes(value as string)) {
          return {
            valid: false,
            errors: [
              {
                message: `Invalid enum value. Expected one of ${validValues.join(", ")}`,
                expected: `Enum(${validValues.join(", ")})`,
                received: typeof value,
                value,
              }
            ]
          }
        }
      }

      return {
        validate,
      }
    }
    const basicPlugin = {
      name: "MyEnumPlugin",
      description: "Plugin for MyEnum",
      version: "1.0.0",
      types: [MyEnum],
    }
    const monoSchema = configureMonoSchema({
      plugins: [basicPlugin],
    })
    type MonoSchema = typeof monoSchema
    const basicSchema: MonoSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number },
        status: { $type: MyEnum() },
      },
    }
    // MonoSchema type should be inferred correctly
    const validData = {
      name: "John Doe",
      age: 30,
      status: "value1",
    }
    const invalidData = {
      name: "John Doe",
      age: 30,
      status: "invalidValue", // Invalid enum value
    }
    // Validate the data against the schema
    const validate = monoSchema.validate(basicSchema)
    const isValid = validate(validData)
    const isInvalid = validate(invalidData)
    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [] })
    expect(isInvalid).toStrictEqual({
      valid: false,
      errors: [
        {
          path: 'status',
          message: 'Invalid enum value. Expected one of value1, value2, value3',
          expected: 'Enum(value1, value2, value3)',
          received: 'String',
          value: 'invalidValue',
        },
      ],
    })
  })

  it('should provide type inference for schemas', () => {
    const monoSchema = configureMonoSchema()
    type MonoSchema = typeof monoSchema
    const basicSchema: MonoSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
      },
    }
    // MonoSchema type should be inferred correctly
    const myFunction = <Schema extends MonoSchema>(schema: Schema, propertyPath: MonogSchemaPropertPath<Schema>) => {
      const splitPath = propertyPath.split('.')
      let currentSchema: any = schema
      for (const part of splitPath) {
        if (currentSchema.$properties && currentSchema.$properties[part]) {
          currentSchema = currentSchema.$properties[part]
        } else {
          throw new Error(`Property ${propertyPath} does not exist in schema`)
        }
      }
      return true
    }

    // Valid usage
    myFunction(basicSchema, 'name') // Valid
    myFunction(basicSchema, 'age') // Valid
    myFunction(basicSchema, 'isActive') // Valid
    myFunction(basicSchema, 'hobbies') // Valid

    // Invalid usage
    myFunction(basicSchema, 'doesNotExist') // Invalid, should give a type error

    // Check validation results
    expect(() => myFunction(basicSchema, 'name')).toEqual(true)
    expect(() => myFunction(basicSchema, 'age')).toEqual(true)
    expect(() => myFunction(basicSchema, 'isActive')).toEqual(true)
    expect(() => myFunction(basicSchema, 'hobbies')).toEqual(true)
    expect(() => myFunction(basicSchema, 'doesNotExist')).toThrowError(
      `Property doesNotExist does not exist in schema`
    )
  })
})