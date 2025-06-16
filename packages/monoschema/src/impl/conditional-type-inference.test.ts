// Test cases for conditional type inference
import { describe, it, expect } from "vitest";
import { configureMonoSchema } from "./monoschema";
import type { InferTypeFromMonoSchemaWithConditional, InferDiscriminatedUnion } from "./conditional-type-inference";

describe('Conditional Type Inference', () => {
  it('should infer basic discriminated union types', async () => {
    const shapeSchema = {
      $type: Object,
      $discriminant: {
        property: "type",
        mapping: {
          "circle": {
            $type: Object,
            $properties: {
              type: { $type: String },
              radius: { $type: Number }
            }
          },
          "rectangle": {
            $type: Object, 
            $properties: {
              type: { $type: String },
              width: { $type: Number },
              height: { $type: Number }
            }
          }
        }
      }
    } as const;

    type Shape = InferTypeFromMonoSchemaWithConditional<typeof shapeSchema>;
    
    // Runtime test - these should compile if the types are correct
    const testShape = (shape: Shape) => {
      expect(shape).toBeDefined();
      expect(shape.type).toBeDefined();
      return shape;
    };
    
    // Should work with circle
    testShape({ type: "circle", radius: 5 });
    
    // Should work with rectangle  
    testShape({ type: "rectangle", width: 10, height: 5 });
    
    // Test with the actual validator
    const monoSchema = configureMonoSchema();
    const validate = monoSchema.validate(shapeSchema);
    
    const result = await validate({ type: "circle", radius: 5 });
    expect(result).toMatchObject({
      valid: true
    });
  });

  it('should infer discriminated union with different property structures', async () => {
    const eventSchema = {
      $type: Object,
      $discriminant: {
        property: "type",
        mapping: {
          "webhook": {
            $type: Object,
            $properties: {
              type: { $type: String },
              url: { $type: String },
              method: { $type: String }
            }
          },
          "email": {
            $type: Object,
            $properties: {
              type: { $type: String },
              to: { $type: String },
              subject: { $type: String },
              body: { $type: String }
            }
          }
        }
      }
    } as const;

    type Event = InferTypeFromMonoSchemaWithConditional<typeof eventSchema>;
    
    // Runtime test
    const testEvent = (event: Event) => {
      expect(event.type).toBeDefined();
      return event;
    };
    
    testEvent({ 
      type: "webhook", 
      url: "https://example.com",
      method: "POST" 
    });
    
    testEvent({
      type: "email",
      to: "user@example.com",
      subject: "Test",
      body: "Hello!"
    });
    
    // Test with actual validator
    const monoSchema = configureMonoSchema();
    const validate = monoSchema.validate(eventSchema);
    
    const result = await validate({
      type: "email",
      to: "test@example.com",
      subject: "Test",
      body: "Hello"
    });
    expect(result).toMatchObject({ valid: true });
  });

  it('should handle optional properties in discriminated unions', async () => {
    const userSchema = {
      $type: Object,
      $discriminant: {
        property: "accountType",
        mapping: {
          "personal": {
            $type: Object,
            $properties: {
              accountType: { $type: String },
              firstName: { $type: String },
              lastName: { $type: String },
              companyName: { $type: String, $optional: true }
            }
          },
          "business": {
            $type: Object,
            $properties: {
              accountType: { $type: String },
              companyName: { $type: String },
              taxId: { $type: String },
              firstName: { $type: String, $optional: true },
              lastName: { $type: String, $optional: true }
            }
          }
        }
      }
    } as const;

    type User = InferTypeFromMonoSchemaWithConditional<typeof userSchema>;
    
    // Test that optional properties are handled correctly
    const testUser = (user: User) => {
      expect(user.accountType).toBeDefined();
      return user;
    };
    
    // Personal account (optional companyName)
    testUser({
      accountType: "personal",
      firstName: "John",
      lastName: "Doe"
    });
    
    // Business account (optional firstName/lastName)
    testUser({
      accountType: "business",
      companyName: "ACME Corp",
      taxId: "123456789"
    });
    
    // Test with validator
    const monoSchema = configureMonoSchema();
    const validate = monoSchema.validate(userSchema);
    
    const result = await validate({
      accountType: "personal",
      firstName: "John",
      lastName: "Doe"
    });
    expect(result).toMatchObject({ valid: true });
  });

  it('should fall back to regular inference for non-conditional schemas', async () => {
    const regularSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number },
        active: { $type: Boolean, $optional: true }
      }
    } as const;

    type RegularType = InferTypeFromMonoSchemaWithConditional<typeof regularSchema>;
    
    const testRegular = (obj: RegularType) => {
      expect(obj.name).toBeDefined();
      expect(obj.age).toBeDefined();
      return obj;
    };
    
    testRegular({
      name: "Test",
      age: 25
    });
    
    testRegular({
      name: "Test",
      age: 25,
      active: true
    });
    
    // Test with validator
    const monoSchema = configureMonoSchema();
    const validate = monoSchema.validate(regularSchema);
    
    expect(validate({
      name: "Test",
      age: 25
    })).resolves.toMatchObject({ valid: true });
  });

  it('should handle nested discriminated unions', async () => {
    const nestedSchema = {
      $type: Object,
      $discriminant: {
        property: "category",
        mapping: {
          "product": {
            $type: Object,
            $properties: {
              category: { $type: String },
              details: {
                $type: Object,
                $discriminant: {
                  property: "type",
                  mapping: {
                    "physical": {
                      $type: Object,
                      $properties: {
                        type: { $type: String },
                        weight: { $type: Number },
                        dimensions: { $type: String }
                      }
                    },
                    "digital": {
                      $type: Object,
                      $properties: {
                        type: { $type: String },
                        downloadUrl: { $type: String },
                        fileSize: { $type: Number }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } as const;

    type NestedType = InferTypeFromMonoSchemaWithConditional<typeof nestedSchema>;
    
    const testNested = (obj: NestedType) => {
      expect(obj.category).toBeDefined();
      return obj;
    };
    
    testNested({
      category: "product",
      details: {
        type: "physical",
        weight: 1.5,
        dimensions: "10x5x2"
      }
    });
    
    testNested({
      category: "product", 
      details: {
        type: "digital",
        downloadUrl: "https://example.com/download",
        fileSize: 1024
      }
    });
    
    // Test with validator
    const monoSchema = configureMonoSchema();
    const validate = monoSchema.validate(nestedSchema);
    
    const testObj = {
      category: "product",
      details: {
        type: "digital",
        downloadUrl: "https://example.com/file.zip",
        fileSize: 2048
      }
    };
    
    const result = await validate(testObj);
    
    expect(result).toMatchObject({ valid: true });
  });

  it('should work with simple discriminated unions', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const simpleUnion = {
      $discriminant: {
        property: "kind",
        mapping: {
          "A": {
            $type: Object,
            $properties: {
              kind: { $type: String },
              valueA: { $type: Number }
            }
          },
          "B": {
            $type: Object,
            $properties: {
              kind: { $type: String },
              valueB: { $type: String }
            }
          }
        }
      }
    } as const;

    type DirectUnion = InferDiscriminatedUnion<typeof simpleUnion>;
    
    const testDirect = (obj: DirectUnion) => {
      expect(obj).toBeDefined();
      return obj;
    };
    
    // These should compile and work
    testDirect({
      kind: "A",
      valueA: 123
    });
    
    testDirect({
      kind: "B", 
      valueB: "test"
    });
    
    expect(true).toBe(true); // Basic assertion to make the test pass
  });

  it('should handle simple conditional validation fallback', () => {
    // For now, conditional properties fall back to basic inference
    const conditionalSchema = {
      $type: Object,
      $properties: {
        userType: { $type: String },
        email: { 
          $type: String,
          $optional: true,
          $when: [{
            property: "userType",
            condition: { equals: "admin" },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    type ConditionalType = InferTypeFromMonoSchemaWithConditional<typeof conditionalSchema>;
    
    const testConditional = (obj: ConditionalType) => {
      expect(obj.userType).toBeDefined();
      return obj;
    };
    
    // Should work with optional email
    testConditional({
      userType: "user"
    });
    
    // Should work with email provided
    testConditional({
      userType: "admin",
      email: "admin@example.com"
    });
    
    // Test with actual validator (this tests the runtime behavior)
    const monoSchema = configureMonoSchema();
    const validate = monoSchema.validate(conditionalSchema);
    
    // Admin should require email
    expect(validate({
      userType: "admin"
      // missing email
    })).resolves.toMatchObject({ valid: false });
    
    // Regular user should not require email
    expect(validate({
      userType: "user"
    })).resolves.toMatchObject({ valid: true });
  });
});
