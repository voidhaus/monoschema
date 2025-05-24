import { describe, it, expect } from "vitest";
import { configureMonoSchema, MonogSchemaPropertPath, InferTypeFromMonoSchema } from "./monoschema";

describe('monoschema', () => {
  it('should allow creating a schema', () => {
    const monoSchema = configureMonoSchema()
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number, $optional: true },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
        favouriteNumbers: { $type: [Number] },
      },
    } as const
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const validData: MySchemaType = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "gaming"],
      favouriteNumbers: [1, 2, 3],
    }
    const validOptionalData: MySchemaType = {
      name: "John Doe",
      age: undefined,
      isActive: true,
      hobbies: ["reading", "gaming"],
      favouriteNumbers: [1, 2, 3],
    }
    const invalidData: MySchemaType = {
      name: "John Doe",
      // @ts-expect-error
      age: "thirty", // Invalid type
      isActive: true,
      hobbies: ["reading", "gaming"],
      favouriteNumbers: [1, 2, 3],
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
    const nestedSchema = {
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
    } as const
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
    const myNumEnum = () => {
      const validValues = [1, 2, 3]

      const validate = (value: unknown) => {
        if (!validValues.includes(value as number)) {
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
    const basicPlugin2 = {
      name: "MyNumEnumPlugin",
      description: "Plugin for MyNumEnum",
      version: "1.0.0",
      types: [myNumEnum],
    }
    const monoSchema = configureMonoSchema({
      plugins: [basicPlugin, basicPlugin2],
    })
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number },
        status: { $type: MyEnum },
        numStatus: { $type: myNumEnum },
      },
    } as const
    // MonoSchema type should be inferred correctly
    const validData = {
      name: "John Doe",
      age: 30,
      status: "value1",
      numStatus: 1,
    }
    const invalidData = {
      name: "John Doe",
      age: 30,
      status: "invalidValue", // Invalid enum value
      numStatus: 4, // Invalid enum value
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
        {
          path: 'numStatus',
          message: 'Invalid enum value. Expected one of 1, 2, 3',
          expected: 'Enum(1, 2, 3)',
          received: 'Number',
          value: 4,
        },
      ],
    })
  })

  it('should provide type inference for schemas', () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
      },
    } as const;
    // MonoSchema type should be inferred correctly
    const myFunction = <Schema>(schema: Schema, propertyPath: MonogSchemaPropertPath<Schema>) => {
      const splitPath = (propertyPath as string).split('.')
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
    expect(myFunction(basicSchema, 'name')).toEqual(true)
    expect(myFunction(basicSchema, 'age')).toEqual(true)
    expect(myFunction(basicSchema, 'isActive')).toEqual(true)
    expect(myFunction(basicSchema, 'hobbies')).toEqual(true)

    // Invalid usage (type-level, not runtime)
    // @ts-expect-error
    expect(() => myFunction(basicSchema, 'doesNotExist')).throws() // Invalid, should give a type error at compile time
  })

  it('should allow type intererence', () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number, $optional: true },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
      },
    } as const;
    // MonoSchema type should be inferred correctly
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    const validData: MySchemaType = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "gaming"],
    }
    // Error here should be caught at compile time because age is the wrong type
    const invalidData: MySchemaType = {
      name: "John Doe",
      // @ts-expect-error
      age: "thirty", // Invalid type
      isActive: true,
      hobbies: ["reading", "gaming"],
    }
  })

  it('should allow type intererence on extensions', () => {
    const MyEnum = Object.assign(
      () => ({
        validate: (value: unknown) => {
          const validValues = ["value1", "value2", "value3"];
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
          return { valid: true, errors: [] }
        },
      }),
      { tsType: null as unknown as "value1" | "value2" | "value3" }
    );
    const basicPlugin = {
      name: "MyEnumPlugin",
      description: "Plugin for MyEnum",
      version: "1.0.0",
      types: [MyEnum],
    }
    const MyNumEnum = Object.assign(
      () => {
        const validValues = [1, 2, 3];
        const validate = (value: unknown) => {
          if (!validValues.includes(value as number)) {
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
            };
          }
          return { valid: true, errors: [] };
        };
        return { validate };
      },
      { tsType: null as unknown as 1 | 2 | 3 }
    );
    const basicPlugin2 = {
      name: "MyNumEnumPlugin",
      description: "Plugin for MyNumEnum",
      version: "1.0.0",
      types: [MyNumEnum],
    }
    const monoSchema = configureMonoSchema({
      plugins: [basicPlugin, basicPlugin2],
    })
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number },
        status: { $type: MyEnum },
        numStatus: { $type: MyNumEnum },
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const validData: MySchemaType = {
      name: "John Doe",
      age: 30,
      status: "value1",
      numStatus: 1,
    }
    // Error here should be caught at compile time because age is the wrong type
    const invalidData: MySchemaType = {
      name: "John Doe",
      // @ts-expect-error
      age: "40", // should error: string is not assignable to number
      // @ts-expect-error
      status: 4,
      // @ts-expect-error
      numStatus: "notAString", // Invalid enum value (will be unknown)
    }

    const validate = monoSchema.validate(basicSchema)
    validate(validData)
    validate(invalidData)
  })
})