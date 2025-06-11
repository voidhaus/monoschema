// Test cases for conditional validation prototype
import { describe, it, expect } from "vitest";
import { configureMonoSchema } from "./monoschema";

describe('Conditional Validation', () => {
  it('should work without conditional validation (baseline)', async () => {
    const monoSchema = configureMonoSchema();
    
    const basicSchema = {
      $type: Object,
      $properties: {
        name: { $type: String },
        age: { $type: Number }
      }
    } as const;

    const validate = monoSchema.validate(basicSchema);
    
    const validData = {
      name: "John",
      age: 30
    };
    
    const result = await validate(validData);
    expect(result.valid).toBe(true);
  });

  it('should handle simple conditional required field', async () => {
    const monoSchema = configureMonoSchema();
    
    const userSchema = {
      $type: Object,
      $properties: {
        type: { $type: String },
        email: { 
          $type: String,
          $optional: true,
          $when: [{
            property: "type",
            condition: { equals: "admin" },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(userSchema);
    
    // Test admin user - should require email
    const adminUser = {
      type: "admin",
      email: "admin@example.com"
    };
    
    const adminResult = await validate(adminUser);
    expect(adminResult.valid).toBe(true);
    
    // Test admin user without email - should fail
    const adminUserNoEmail = {
      type: "admin"
      // missing email
    };
    
    const adminNoEmailResult = await validate(adminUserNoEmail);
    expect(adminNoEmailResult.valid).toBe(false);
    expect(adminNoEmailResult.errors).toHaveLength(1);
    expect(adminNoEmailResult.errors[0]).toEqual(
      expect.objectContaining({
        path: 'email',
        message: 'Missing required property'
      })
    );
    
    // Test regular user without email - should pass (email not required)
    const regularUser = {
      type: "user"
      // no email - should be fine
    };
    
    const regularResult = await validate(regularUser);
    expect(regularResult.valid).toBe(true);
  });

  it('should handle discriminated unions', async () => {
    const monoSchema = configureMonoSchema();
    
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

    const validate = monoSchema.validate(shapeSchema);

    // Test circle - should pass
    const circle = {
      type: "circle",
      radius: 5
    };
    const circleResult = await validate(circle);
    expect(circleResult.valid).toBe(true);

    // Test rectangle - should pass
    const rectangle = {
      type: "rectangle",
      width: 10,
      height: 5
    };
    const rectangleResult = await validate(rectangle);
    expect(rectangleResult.valid).toBe(true);

    // Test invalid discriminant - should fail
    const invalidShape = {
      type: "triangle",
      sides: 3
    };
    const invalidResult = await validate(invalidShape);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toHaveLength(1);
    expect(invalidResult.errors[0]?.message).toBe('Unknown discriminant value: triangle');

    // Test circle with missing radius - should fail
    const invalidCircle = {
      type: "circle"
      // missing radius
    };
    const invalidCircleResult = await validate(invalidCircle);
    expect(invalidCircleResult.valid).toBe(false);
    expect(invalidCircleResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'radius',
        message: 'Missing required property'
      })
    );
  });
});
