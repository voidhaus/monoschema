import { describe, it, expect } from "vitest";
import { configureMonoSchema, MonogSchemaPropertPath, InferTypeFromMonoSchema, Plugin, MonoSchemaInstance, Any } from "./monoschema";
import { max, min } from "./constraints";

describe('monoschema', () => {
  it('should allow creating a schema', async () => {
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
      age: "thirty" as unknown as number, // Invalid type
      isActive: true,
      hobbies: ["reading", "gaming"],
      favouriteNumbers: [1, 2, 3],
    }
    // Validate the data against the schema
    const validate = monoSchema.validate(basicSchema)
    const isValid = await validate(validData)
    const isValidOptional = await validate(validOptionalData)
    const isInvalid = await validate(invalidData)
    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [], data: validData })
    expect(isValidOptional).toStrictEqual({ valid: true, errors: [], data: validOptionalData })
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
      data: undefined,
    })
  })

  it('should allow creating a schema with nested objects', async () => {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const isValid = await validate(validData)
    const isInvalid = await validate({
      name: "John Doe",
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: "10001" as unknown, // Invalid type
      },
    })
    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [], data: validData })
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
      data: undefined,
    })
  })

  it('should allow extension of schemas', async () => {
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
    const isValid = await validate(validData)
    const isInvalid = await validate(invalidData)
    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [], data: validData })
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
      data: undefined,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // @ts-expect-error - should give a type error at compile time
    expect(() => myFunction(basicSchema, 'doesNotExist')).throws() // Invalid, should give a type error at compile time
  })

  it('should allow type intererence', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validData: MySchemaType = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "gaming"],
    }
    // Error here should be caught at compile time because age is the wrong type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const invalidData: MySchemaType = {
      name: "John Doe",
      age: "thirty" as unknown as number, // Invalid type
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
      // @ts-expect-error - should error: string is not assignable to number
      age: "40", // should error: string is not assignable to number
      // @ts-expect-error - should error: string is not assignable to "value1" | "value2" | "value3"
      status: 4,
      // @ts-expect-error - should error: number is not assignable to 1 | 2 | 3
      numStatus: "notAString", // Invalid enum value (will be unknown)
    }

    const validate = monoSchema.validate(basicSchema)
    validate(validData)
    validate(invalidData)
  })

  it('should allow type inference on extensions with tsType as arrays', () => {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const monoSchema = configureMonoSchema({
      plugins: [basicPlugin, basicPlugin2],
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number },
        statusArrayOfEnums: { $type: [MyEnum] },
        numStatusArrayOfEnums: { $type: [MyNumEnum] },
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;

    // MonoSchema type should be inferred correctly
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validData: MySchemaType = {
      name: "John Doe",
      age: 30,
      statusArrayOfEnums: ["value1", "value2"],
      numStatusArrayOfEnums: [1, 2],
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const invalidData: MySchemaType = {
      name: "John Doe",
      age: 30,
      // @ts-expect-error - should error: string is not assignable to "value1" | "value2" | "value3"
      statusArrayOfEnums: ["value1", "value2", "invalidValue"], // Invalid enum value
      // @ts-expect-error - should error: number is not assignable to 1 | 2 | 3
      numStatusArrayOfEnums: [1, 2, 4], // Invalid enum value
    }
  })

  it('should allow custom constraints', async () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: {
          $type: Number,
          $constraints: [
            min(18),
            max(30),
          ],
        },
      },
    } as const
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const validData: MySchemaType = {
      name: "John Doe",
      age: 25,
    }
    const invalidData: MySchemaType = {
      name: "John Doe",
      age: 35, // Invalid age
    }
    // Validate the data against the schema
    const validate = configureMonoSchema().validate(basicSchema)
    const isValid = await validate(validData)
    const isInvalid = await validate(invalidData)

    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [], data: validData })
    expect(isInvalid).toStrictEqual({
      valid: false,
      errors: [
        {
          path: 'age',
          message: 'Value 35 is greater than maximum 30',
          expected: 'Number',
          received: 'Number',
          value: 35,
        },
      ],
      data: undefined,
    })
  })

  it('should show multiple errors for multiple constraints', async () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: {
          $type: Number,
          $constraints: [
            min(20),
            max(18),
          ],
        },
      },
    } as const
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const invalidData: MySchemaType = {
      name: "John Doe",
      age: 19,
    }
    // Validate the data against the schema
    const validate = configureMonoSchema().validate(basicSchema)
    const isInvalid = await validate(invalidData)
    // Check the validation results
    expect(isInvalid).toStrictEqual({
      valid: false,
      errors: [
        {
          path: 'age',
          message: 'Value 19 is less than minimum 20',
          expected: 'Number',
          received: 'Number',
          value: 19,
        },
        {
          path: 'age',
          message: 'Value 19 is greater than maximum 18',
          expected: 'Number',
          received: 'Number',
          value: 19,
        },
      ],
      data: undefined,
    })
  })

  it('should only run constraints on optional properties if they are present', async () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: {
          $type: Number,
          $optional: true,
          $constraints: [
            min(18),
            max(30),
          ],
        },
      },
    } as const
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const validData: MySchemaType = {
      name: "John Doe",
      age: undefined, // Optional property
    }
    // Validate the data against the schema
    const validate = configureMonoSchema().validate(basicSchema)
    const isValid = await validate(validData)
    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [], data: validData })
  })

  it('should give a type error for invalid constraint values', () => {
    const invalidConstraint = () => {}
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: {
          $type: Number,
          $constraints: [
            invalidConstraint, // Invalid constraint
          ],
        },
      },
    } as const
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validData: MySchemaType = {
      name: "John Doe",
      age: 25,
    }
    // Validate the data against the schema
    // Expect a type error because invalidConstraint is not a valid constraint
    // @ts-expect-error - should error: invalidConstraint is not a valid constraint
    configureMonoSchema().validate(basicSchema)
  })

  it('should allow updating of property values on inferred types', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number, $optional: true },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
        hasOptedInMarketing: { $type: Boolean, $readonly: true }
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const validData: MySchemaType = {
      name: "John Doe",
      isActive: true,
      hobbies: ["reading", "gaming"],
      hasOptedInMarketing: true, // Readonly property
    }
    // Update the properties
    validData.name = "Jane Doe"; // Update name
    validData.age = 28; // Update age
    validData.isActive = false; // Update isActive
    validData.hobbies.push("cooking"); // Add a hobby
    // @ts-expect-error - readonly property
    validData.hasOptedInMarketing = false; // Attempt to update readonly property (should error)
  })

  it('should support dates', async () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        birthDate: { $type: Date },
        lastLogin: { $type: Date, $optional: true },
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const validData: MySchemaType = {
      name: "John Doe",
      birthDate: new Date("1990-01-01"),
      lastLogin: new Date("2023-10-01"),
    }
    const invalidData: MySchemaType = {
      name: "John Doe",
      birthDate: "1990-01-01" as unknown as Date, // Invalid type
      lastLogin: new Date("2023-10-01"),
    }
    // Validate the data against the schema
    const validate = configureMonoSchema().validate(basicSchema)
    const isValid = await validate(validData)
    const isInvalid = await validate(invalidData)
    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [], data: validData })
    expect(isInvalid).toStrictEqual({
      valid: false,
      errors: [
        {
          path: 'birthDate',
          message: 'Expected type Date, but received String',
          expected: 'Date',
          received: 'String',
          value: '1990-01-01',
        },
      ],
      data: undefined,
    })
  })

  it('should support prevalidation with plugins', async () => {
    const MyPlugin: Plugin = {
      name: "MyPlugin",
      description: "A plugin for prevalidation",
      version: "1.0.0",
      types: [],
      prevalidate: [
        (value: unknown) => {
          if (typeof value === 'string') {
            return `Transformed: ${value}`;
          }
          return value;
        },
      ],
    }
    const monoSchema = configureMonoSchema({
      plugins: [MyPlugin],
    })
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number },
        isActive: { $type: Boolean },
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;

    // MonoSchema type should be inferred correctly
    const validData: MySchemaType = {
      name: "John Doe",
      age: 30,
      isActive: true,
    }

    // Validate the data against the schema
    const validate = monoSchema.validate(basicSchema)
    const isValid = await validate(validData)

    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [], data: {
      name: "Transformed: John Doe",
      age: 30,
      isActive: true,
    }})
  })

  it('should be able to handle nested schemas', async () => {
    const propertySchema = {
      $type: Object,
      $properties: {
        name: {
          $type: String,
          $description: "The name of the property.",
        },
        type: {
          $type: String,
          $description: "The type of the property (e.g., 'string', 'number', 'boolean').",
        },
        description: {
          $type: String,
          $description: "A brief description of the property.",
          $optional: true,
        },
        required: {
          $type: Boolean,
          $description: "Whether the property is required.",
          $optional: true,
        },
      },
    } as const;
    const BuildingBlockType = Object.assign(
      () => ({
        validate: async (value: unknown, monoschemaInstance?: MonoSchemaInstance) => {
          if (!monoschemaInstance) {
            return { valid: false, errors: [{ message: "MonoSchemaInstance required", expected: "MonoSchemaInstance", received: "undefined", value }] };
          }
          const validate = monoschemaInstance.validate(propertySchema)
          return await validate(value)
        },
      }),
      { tsType: null as unknown as InferTypeFromMonoSchema<typeof propertySchema> }
    );// as unknown as (() => { validate: (value: unknown, monoSchemaInstance?: MonoSchemaInstance) => unknown }) & { tsType: InferTypeFromMonoSchema<typeof propertySchema> };
    const cmsPlugin: Plugin = {
      name: "CMSPlugin",
      description: "A plugin for CMS",
      version: "1.0.0",
      types: [BuildingBlockType],
    }
    const monoSchema = configureMonoSchema({
      plugins: [cmsPlugin],
    })
    const basicSchema = {
      $type: Object,
      $properties: {
        name: {
          $type: String,
          $description: "The name of the building block.",
        },
        description: {
          $type: String,
          $description: "A brief description of the building block.",
          $optional: true,
        },
        properties: {
          $type: [BuildingBlockType],
          $description: "The properties of the building block.",
        },
      },
    } as const;
    type BuildingBlockSchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const validData: BuildingBlockSchemaType = {
      name: "My Building Block",
      description: "A description of my building block.",
      properties: [
        {
          name: "Property 1",
          type: "string",
          description: "A string property.",
          required: true,
        },
        {
          name: "Property 2",
          type: "number",
          description: "A number property.",
          required: false,
        },
      ],
    }
    const invalidData: BuildingBlockSchemaType = {
      name: "My Building Block",
      description: "A description of my building block.",
      properties: [
        {
          name: "Property 1",
          type: "string",
          description: "A string property.",
          required: true,
        },
        {
          name: "Property 2",
          type: 123 as unknown as string, // Invalid type - should be string
          description: "A number property.",
          required: false,
        },
      ],
    }
    // Validate the data against the schema
    const validate = monoSchema.validate(basicSchema)
    const isValid = await validate(validData)
    const isInvalid = await validate(invalidData)
    // Check the validation results
    expect(isValid).toStrictEqual({ valid: true, errors: [], data: validData })
    expect(isInvalid.valid).toBe(false)
  })

  it('should strip unknown properties when option is set', async () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number, $optional: true },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const almostValidData: MySchemaType = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "gaming"],
      // @ts-expect-error - should error: extraField is not part of the schema
      extraField: "This should be stripped", // Extra field not in schema
    }
    // Validate the data against the schema
    const validate = configureMonoSchema({
      stripUnknownProperties: true, // Enable stripping of unknown properties
    }).validate(basicSchema)
    const isAlmostValid = await validate(almostValidData)
    // Check the validation results
    expect(isAlmostValid).toStrictEqual({
      valid: true,
      errors: [],
      data: {
        name: "John Doe",
        age: 30,
        isActive: true,
        hobbies: ["reading", "gaming"],
        // extraField should be stripped out
      },
    })
  })

  it('should error on unknown properties when option is set', async () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number, $optional: true },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const almostValidData: MySchemaType = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "gaming"],
      // @ts-expect-error - should error: extraField is not part of the schema
      extraField: "This should cause an error", // Extra field not in schema
    }
    // Validate the data against the schema
    const validate = configureMonoSchema({
      errorUnknownProperties: true, // Disable stripping of unknown properties
    }).validate(basicSchema)
    const isAlmostValid = await validate(almostValidData)
    // Check the validation results
    expect(isAlmostValid).toStrictEqual({
      valid: false,
      errors: [
        {
          path: 'extraField',
          message: 'Unexpected property found: extraField',
          expected: 'undefined',
          received: 'String',
          value: "This should cause an error",
        },
      ],
      data: undefined,
    })
    expect(isAlmostValid.valid).toBe(false)
    expect(isAlmostValid.errors.length).toBeGreaterThan(0)
    expect(isAlmostValid.errors[0]!.message).toContain('Unexpected property found: extraField')
  })

  it('should not strip or error on unknown properties when options are not set', async () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number, $optional: true },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const almostValidData: MySchemaType = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "gaming"],
      // @ts-expect-error - should error: extraField is not part of the schema
      extraField: "This should not cause an error or be stripped", // Extra field not in schema
    }
    // Validate the data against the schema
    const validate = configureMonoSchema().validate(basicSchema)
    const isAlmostValid = await validate(almostValidData)
    // Check the validation results
    expect(isAlmostValid).toStrictEqual({
      valid: true,
      errors: [],
      data: {
        name: "John Doe",
        age: 30,
        isActive: true,
        hobbies: ["reading", "gaming"],
        extraField: "This should not cause an error or be stripped", // Extra field should remain
      },
    })
  })

  it('should strip unknown properties', async () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number, $optional: true },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
        address: {
          $type: Object,
          $properties: {
            street: { $type: String },
            city: { $type: String },
            zipCode: { $type: Number, $optional: true },
          },
        },
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const almostValidData: MySchemaType = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "gaming"],
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: 10001,
        // @ts-expect-error - should error or strip unknown property
        extraField: "This should not be here", // Extra field not in schema
      },
    }
    // Validate the data against the schema
    const validate = configureMonoSchema({
      stripUnknownProperties: true, // Enable stripping of unknown properties
    }).validate(basicSchema)
    const isAlmostValid = await validate(almostValidData)
    // Check the validation results
    expect(isAlmostValid).toStrictEqual({
      valid: true,
      errors: [],
      data: {
        name: "John Doe",
        age: 30,
        isActive: true,
        hobbies: ["reading", "gaming"],
        address: {
          street: "123 Main St",
          city: "New York",
          zipCode: 10001,
          // extraField should be stripped out
        },
      },
    })
  })

  it('should error on nested unknown properties', async () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number, $optional: true },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
        address: {
          $type: Object,
          $properties: {
            street: { $type: String },
            city: { $type: String },
            zipCode: { $type: Number, $optional: true },
          },
        },
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const almostValidData: MySchemaType = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "gaming"],
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: 10001,
        // @ts-expect-error - should error or strip unknown property
        extraField: "This should cause an error", // Extra field not in schema
      },
    }
    // Validate the data against the schema
    const validate = configureMonoSchema({
      errorUnknownProperties: true, // Enable erroring on unknown properties
    }).validate(basicSchema)
    const isAlmostValid = await validate(almostValidData)
    // Check the validation results
    expect(isAlmostValid).toStrictEqual({
      valid: false,
      errors: [
        {
          path: 'address.extraField',
          message: 'Unexpected property found: extraField',
          expected: 'undefined',
          received: 'String',
          value: "This should cause an error",
        }
      ],
      data: undefined,
    })
    expect(isAlmostValid.valid).toBe(false)
  })

  it('should not strip or error on unknown properties for nested any type', async () => {
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number, $optional: true },
        isActive: { $type: Boolean },
        hobbies: { $type: [String] },
        address: {
          $type: Any,
        },
      },
    } as const;
    type MySchemaType = InferTypeFromMonoSchema<typeof basicSchema>;
    // MonoSchema type should be inferred correctly
    const validData: MySchemaType = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "gaming"],
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: 10001,
        extraField: "This should not cause an error or be stripped", // Extra field not in schema
      },
    }
    // Validate the data against the schema
    const validate = configureMonoSchema().validate(basicSchema)
    const isAlmostValid = await validate(validData)
    // Check the validation results
    expect(isAlmostValid).toStrictEqual({
      valid: true,
      errors: [],
      data: validData, // Extra field should remain
    })
  })
})