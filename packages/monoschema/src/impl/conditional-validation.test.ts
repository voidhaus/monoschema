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
  
  it('should handle "in" condition for multiple values', async () => {
    const monoSchema = configureMonoSchema();
    
    const productSchema = {
      $type: Object,
      $properties: {
        category: { $type: String },
        shipping: { 
          $type: Object,
          $optional: true,
          $when: [{
            property: "category",
            condition: { in: ["electronics", "books", "clothing"] },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(productSchema);
    
    // Test physical product - should require shipping
    const electronicsProduct = {
      category: "electronics",
      shipping: { weight: 2.5 }
    };
    const electronicsResult = await validate(electronicsProduct);
    expect(electronicsResult.valid).toBe(true);

    // Test physical product without shipping - should fail
    const booksProductNoShipping = {
      category: "books"
      // missing shipping
    };
    const booksResult = await validate(booksProductNoShipping);
    expect(booksResult.valid).toBe(false);
    expect(booksResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'shipping',
        message: 'Missing required property'
      })
    );

    // Test digital product - should not require shipping
    const digitalProduct = {
      category: "digital"
    };
    const digitalResult = await validate(digitalProduct);
    expect(digitalResult.valid).toBe(true);
  });

  it('should handle "not" condition', async () => {
    const monoSchema = configureMonoSchema();
    
    const subscriptionSchema = {
      $type: Object,
      $properties: {
        type: { $type: String },
        paymentMethod: { 
          $type: String,
          $optional: true,
          $when: [{
            property: "type",
            condition: { not: { equals: "free" } },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(subscriptionSchema);
    
    // Test paid subscription - should require payment method
    const paidSubscription = {
      type: "premium",
      paymentMethod: "credit_card"
    };
    const paidResult = await validate(paidSubscription);
    expect(paidResult.valid).toBe(true);

    // Test paid subscription without payment method - should fail
    const paidNoPayment = {
      type: "premium"
      // missing paymentMethod
    };
    const paidNoPaymentResult = await validate(paidNoPayment);
    expect(paidNoPaymentResult.valid).toBe(false);
    expect(paidNoPaymentResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'paymentMethod',
        message: 'Missing required property'
      })
    );

    // Test free subscription - should not require payment method
    const freeSubscription = {
      type: "free"
    };
    const freeResult = await validate(freeSubscription);
    expect(freeResult.valid).toBe(true);
  });

  it('should handle "and" condition', async () => {
    const monoSchema = configureMonoSchema();
    
    const productSchema = {
      $type: Object,
      $properties: {
        category: { $type: String },
        hasVariants: { $type: Boolean },
        variants: { 
          $type: [String],
          $optional: true,
          $when: [{
            property: "category",
            condition: { 
              and: [
                { in: ["clothing", "electronics"] },
                { custom: (_: unknown, obj: unknown) => {
                  const product = obj as { hasVariants?: boolean };
                  return product.hasVariants === true;
                }}
              ]
            },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(productSchema);
    
    // Test clothing with variants - should require variants array
    const clothingWithVariants = {
      category: "clothing",
      hasVariants: true,
      variants: ["S", "M", "L"]
    };
    const clothingResult = await validate(clothingWithVariants);
    expect(clothingResult.valid).toBe(true);

    // Test clothing with variants but missing variants array - should fail
    const clothingMissingVariants = {
      category: "clothing",
      hasVariants: true
      // missing variants
    };
    const clothingMissingResult = await validate(clothingMissingVariants);
    expect(clothingMissingResult.valid).toBe(false);
    expect(clothingMissingResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'variants',
        message: 'Missing required property'
      })
    );

    // Test clothing without variants - should not require variants array
    const clothingNoVariants = {
      category: "clothing",
      hasVariants: false
    };
    const clothingNoVariantsResult = await validate(clothingNoVariants);
    expect(clothingNoVariantsResult.valid).toBe(true);

    // Test books with variants - should not require variants (category not in list)
    const booksWithVariants = {
      category: "books",
      hasVariants: true
    };
    const booksResult = await validate(booksWithVariants);
    expect(booksResult.valid).toBe(true);
  });

  it('should handle "or" condition', async () => {
    const monoSchema = configureMonoSchema();
    
    const eventSchema = {
      $type: Object,
      $properties: {
        priority: { $type: String },
        type: { $type: String },
        escalationEmail: { 
          $type: String,
          $optional: true,
          $when: [{
            property: "priority",
            condition: { 
              or: [
                { equals: "urgent" },
                { equals: "critical" }
              ]
            },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(eventSchema);
    
    // Test urgent event - should require escalation email
    const urgentEvent = {
      priority: "urgent",
      type: "system_error",
      escalationEmail: "admin@example.com"
    };
    const urgentResult = await validate(urgentEvent);
    expect(urgentResult.valid).toBe(true);

    // Test critical event - should require escalation email
    const criticalEvent = {
      priority: "critical",
      type: "security_breach",
      escalationEmail: "security@example.com"
    };
    const criticalResult = await validate(criticalEvent);
    expect(criticalResult.valid).toBe(true);

    // Test urgent event without email - should fail
    const urgentNoEmail = {
      priority: "urgent",
      type: "system_error"
      // missing escalationEmail
    };
    const urgentNoEmailResult = await validate(urgentNoEmail);
    expect(urgentNoEmailResult.valid).toBe(false);
    expect(urgentNoEmailResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'escalationEmail',
        message: 'Missing required property'
      })
    );

    // Test normal priority - should not require escalation email
    const normalEvent = {
      priority: "normal",
      type: "info"
    };
    const normalResult = await validate(normalEvent);
    expect(normalResult.valid).toBe(true);
  });

  it('should handle custom condition functions', async () => {
    const monoSchema = configureMonoSchema();
    
    const userSchema = {
      $type: Object,
      $properties: {
        age: { $type: Number },
        parentConsent: { 
          $type: Boolean,
          $optional: true,
          $when: [{
            property: "age",
            condition: { 
              custom: (value: unknown) => {
                return typeof value === 'number' && value < 18;
              }
            },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(userSchema);
    
    // Test minor with consent - should pass
    const minorWithConsent = {
      age: 15,
      parentConsent: true
    };
    const minorResult = await validate(minorWithConsent);
    expect(minorResult.valid).toBe(true);

    // Test minor without consent - should fail
    const minorNoConsent = {
      age: 16
      // missing parentConsent
    };
    const minorNoConsentResult = await validate(minorNoConsent);
    expect(minorNoConsentResult.valid).toBe(false);
    expect(minorNoConsentResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'parentConsent',
        message: 'Missing required property'
      })
    );

    // Test adult - should not require parent consent
    const adult = {
      age: 25
    };
    const adultResult = await validate(adult);
    expect(adultResult.valid).toBe(true);
  });

  it('should handle schema replacement with $when', async () => {
    const monoSchema = configureMonoSchema();
    
    const notificationSchema = {
      $type: Object,
      $properties: {
        type: { $type: String },
        config: { 
          $type: Object,
          $when: [
            {
              property: "type",
              condition: { equals: "email" },
              then: { 
                schema: {
                  $type: Object,
                  $properties: {
                    to: { $type: String },
                    subject: { $type: String },
                    body: { $type: String }
                  }
                }
              }
            },
            {
              property: "type",
              condition: { equals: "sms" },
              then: { 
                schema: {
                  $type: Object,
                  $properties: {
                    phoneNumber: { $type: String },
                    message: { $type: String }
                  }
                }
              }
            }
          ] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(notificationSchema);
    
    // Test email notification with correct schema
    const emailNotification = {
      type: "email",
      config: {
        to: "user@example.com",
        subject: "Welcome",
        body: "Welcome to our service!"
      }
    };
    const emailResult = await validate(emailNotification);
    expect(emailResult.valid).toBe(true);

    // Test email notification with missing required field
    const emailMissingSubject = {
      type: "email",
      config: {
        to: "user@example.com",
        body: "Welcome to our service!"
        // missing subject
      }
    };
    const emailMissingResult = await validate(emailMissingSubject);
    expect(emailMissingResult.valid).toBe(false);
    expect(emailMissingResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'config.subject',
        message: 'Missing required property'
      })
    );

    // Test SMS notification with correct schema
    const smsNotification = {
      type: "sms",
      config: {
        phoneNumber: "+1234567890",
        message: "Your verification code is 123456"
      }
    };
    const smsResult = await validate(smsNotification);
    expect(smsResult.valid).toBe(true);

    // Test push notification (no specific schema) - should use base Object type
    const pushNotification = {
      type: "push",
      config: {
        deviceId: "abc123",
        title: "New message",
        body: "You have a new message"
      }
    };
    const pushResult = await validate(pushNotification);
    expect(pushResult.valid).toBe(true);
  });

  it('should handle multiple conditional rules on the same property', async () => {
    const monoSchema = configureMonoSchema();
    
    const documentSchema = {
      $type: Object,
      $properties: {
        type: { $type: String },
        status: { $type: String },
        approvalSignature: { 
          $type: String,
          $optional: true,
          $when: [
            {
              property: "type",
              condition: { equals: "contract" },
              then: { required: true }
            },
            {
              property: "status",
              condition: { equals: "approved" },
              then: { required: true }
            }
          ] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(documentSchema);
    
    // Test contract type - should require signature
    const contract = {
      type: "contract",
      status: "draft",
      approvalSignature: "John Doe"
    };
    const contractResult = await validate(contract);
    expect(contractResult.valid).toBe(true);

    // Test approved document - should require signature
    const approvedDoc = {
      type: "memo",
      status: "approved",
      approvalSignature: "Jane Smith"
    };
    const approvedResult = await validate(approvedDoc);
    expect(approvedResult.valid).toBe(true);

    // Test contract without signature - should fail
    const contractNoSig = {
      type: "contract",
      status: "draft"
      // missing approvalSignature
    };
    const contractNoSigResult = await validate(contractNoSig);
    expect(contractNoSigResult.valid).toBe(false);
    expect(contractNoSigResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'approvalSignature',
        message: 'Missing required property'
      })
    );

    // Test regular draft memo - should not require signature
    const draftMemo = {
      type: "memo",
      status: "draft"
    };
    const draftResult = await validate(draftMemo);
    expect(draftResult.valid).toBe(true);
  });

  it('should handle conditional validation with else clause', async () => {
    const monoSchema = configureMonoSchema();
    
    const memberSchema = {
      $type: Object,
      $properties: {
        membershipType: { $type: String },
        annualFee: { 
          $type: Number,
          $optional: true,
          $when: [{
            property: "membershipType",
            condition: { equals: "premium" },
            then: { required: true },
            else: { required: false }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(memberSchema);
    
    // Test premium membership - should require annual fee
    const premiumMember = {
      membershipType: "premium",
      annualFee: 99.99
    };
    const premiumResult = await validate(premiumMember);
    expect(premiumResult.valid).toBe(true);

    // Test premium membership without fee - should fail
    const premiumNoFee = {
      membershipType: "premium"
      // missing annualFee
    };
    const premiumNoFeeResult = await validate(premiumNoFee);
    expect(premiumNoFeeResult.valid).toBe(false);
    expect(premiumNoFeeResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'annualFee',
        message: 'Missing required property'
      })
    );

    // Test basic membership - should explicitly not require annual fee
    const basicMember = {
      membershipType: "basic"
      // no annualFee - should be fine due to else clause
    };
    const basicResult = await validate(basicMember);
    expect(basicResult.valid).toBe(true);
  });

  it('should handle exists condition', async () => {
    const monoSchema = configureMonoSchema();
    
    const profileSchema = {
      $type: Object,
      $properties: {
        avatar: { $type: String, $optional: true },
        avatarAlt: { 
          $type: String,
          $optional: true,
          $when: [{
            property: "avatar",
            condition: { exists: true },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(profileSchema);
    
    // Test profile with avatar and alt text - should pass
    const profileWithAvatar = {
      avatar: "https://example.com/avatar.jpg",
      avatarAlt: "User profile picture"
    };
    const withAvatarResult = await validate(profileWithAvatar);
    expect(withAvatarResult.valid).toBe(true);

    // Test profile with avatar but no alt text - should fail
    const profileMissingAlt = {
      avatar: "https://example.com/avatar.jpg"
      // missing avatarAlt
    };
    const missingAltResult = await validate(profileMissingAlt);
    expect(missingAltResult.valid).toBe(false);
    expect(missingAltResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'avatarAlt',
        message: 'Missing required property'
      })
    );

    // Test profile without avatar - should not require alt text
    const profileNoAvatar = {
      // no avatar, no avatarAlt
    };
    const noAvatarResult = await validate(profileNoAvatar);
    expect(noAvatarResult.valid).toBe(true);
  });

  it('should handle range condition for numeric values', async () => {
    const monoSchema = configureMonoSchema();
    
    const accountSchema = {
      $type: Object,
      $properties: {
        balance: { $type: Number },
        overdraftProtection: { 
          $type: Boolean,
          $optional: true,
          $when: [{
            property: "balance",
            condition: { range: { min: -1000, max: 0 } },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(accountSchema);
    
    // Test negative balance in range - should require overdraft protection
    const negativeBalance = {
      balance: -500,
      overdraftProtection: true
    };
    const negativeResult = await validate(negativeBalance);
    expect(negativeResult.valid).toBe(true);

    // Test negative balance without overdraft protection - should fail
    const negativeNoProtection = {
      balance: -250
      // missing overdraftProtection
    };
    const negativeNoProtectionResult = await validate(negativeNoProtection);
    expect(negativeNoProtectionResult.valid).toBe(false);
    expect(negativeNoProtectionResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'overdraftProtection',
        message: 'Missing required property'
      })
    );

    // Test positive balance - should not require overdraft protection
    const positiveBalance = {
      balance: 1000
    };
    const positiveResult = await validate(positiveBalance);
    expect(positiveResult.valid).toBe(true);

    // Test balance too low (below min) - should not require overdraft protection
    const veryNegativeBalance = {
      balance: -2000
    };
    const veryNegativeResult = await validate(veryNegativeBalance);
    expect(veryNegativeResult.valid).toBe(true);
  });

  it('should handle matches condition with regex patterns', async () => {
    const monoSchema = configureMonoSchema();
    
    const userSchema = {
      $type: Object,
      $properties: {
        email: { $type: String },
        workProfile: { 
          $type: Object,
          $optional: true,
          $when: [{
            property: "email",
            condition: { matches: /^[^@]+@(company\.com|business\.org)$/ },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(userSchema);
    
    // Test corporate email - should require work profile
    const corporateUser = {
      email: "john.doe@company.com",
      workProfile: {
        department: "Engineering",
        title: "Developer"
      }
    };
    const corporateResult = await validate(corporateUser);
    expect(corporateResult.valid).toBe(true);

    // Test business email - should require work profile
    const businessUser = {
      email: "jane.smith@business.org",
      workProfile: {
        department: "Sales",
        title: "Manager"
      }
    };
    const businessResult = await validate(businessUser);
    expect(businessResult.valid).toBe(true);

    // Test corporate email without work profile - should fail
    const corporateNoProfile = {
      email: "user@company.com"
      // missing workProfile
    };
    const corporateNoProfileResult = await validate(corporateNoProfile);
    expect(corporateNoProfileResult.valid).toBe(false);
    expect(corporateNoProfileResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'workProfile',
        message: 'Missing required property'
      })
    );

    // Test personal email - should not require work profile
    const personalUser = {
      email: "user@gmail.com"
    };
    const personalResult = await validate(personalUser);
    expect(personalResult.valid).toBe(true);
  });

  it('should handle complex nested conditions', async () => {
    const monoSchema = configureMonoSchema();
    
    const orderSchema = {
      $type: Object,
      $properties: {
        customerType: { $type: String },
        orderValue: { $type: Number },
        region: { $type: String },
        expeditedShipping: { 
          $type: Boolean,
          $optional: true,
          $when: [{
            property: "customerType",
            condition: { 
              and: [
                { in: ["premium", "vip"] },
                {
                  or: [
                    { custom: (_: unknown, obj: unknown) => {
                      const order = obj as { orderValue?: number };
                      return (order.orderValue || 0) > 1000;
                    }},
                    { custom: (_: unknown, obj: unknown) => {
                      const order = obj as { region?: string };
                      return order.region === "international";
                    }}
                  ]
                }
              ]
            },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(orderSchema);
    
    // Test premium customer with high value order - should require expedited shipping
    const premiumHighValue = {
      customerType: "premium",
      orderValue: 1500,
      region: "domestic",
      expeditedShipping: true
    };
    const premiumHighValueResult = await validate(premiumHighValue);
    expect(premiumHighValueResult.valid).toBe(true);

    // Test VIP customer with international order - should require expedited shipping
    const vipInternational = {
      customerType: "vip",
      orderValue: 500,
      region: "international",
      expeditedShipping: true
    };
    const vipInternationalResult = await validate(vipInternational);
    expect(vipInternationalResult.valid).toBe(true);

    // Test premium customer with low value domestic order - should not require expedited shipping
    const premiumLowValue = {
      customerType: "premium",
      orderValue: 200,
      region: "domestic"
    };
    const premiumLowValueResult = await validate(premiumLowValue);
    expect(premiumLowValueResult.valid).toBe(true);

    // Test VIP customer with high value order but missing expedited shipping - should fail
    const vipMissingShipping = {
      customerType: "vip",
      orderValue: 2000,
      region: "domestic"
      // missing expeditedShipping
    };
    const vipMissingShippingResult = await validate(vipMissingShipping);
    expect(vipMissingShippingResult.valid).toBe(false);
    expect(vipMissingShippingResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'expeditedShipping',
        message: 'Missing required property'
      })
    );

    // Test regular customer - should not require expedited shipping regardless of order value
    const regularCustomer = {
      customerType: "regular",
      orderValue: 5000,
      region: "international"
    };
    const regularResult = await validate(regularCustomer);
    expect(regularResult.valid).toBe(true);
  });

  it('should handle conditional type changes', async () => {
    const monoSchema = configureMonoSchema();
    
    const configSchema = {
      $type: Object,
      $properties: {
        mode: { $type: String },
        value: { 
          $type: String,  // default type
          $when: [
            {
              property: "mode",
              condition: { equals: "numeric" },
              then: { type: Number }
            },
            {
              property: "mode",  
              condition: { equals: "boolean" },
              then: { type: Boolean }
            }
          ] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(configSchema);
    
    // Test string mode - should accept string value
    const stringConfig = {
      mode: "string",
      value: "hello world"
    };
    const stringResult = await validate(stringConfig);
    expect(stringResult.valid).toBe(true);

    // Test numeric mode - should accept number value
    const numericConfig = {
      mode: "numeric",
      value: 42
    };
    const numericResult = await validate(numericConfig);
    expect(numericResult.valid).toBe(true);

    // Test boolean mode - should accept boolean value
    const booleanConfig = {
      mode: "boolean",
      value: true
    };
    const booleanResult = await validate(booleanConfig);
    expect(booleanResult.valid).toBe(true);

    // Test numeric mode with string value - should fail
    const numericWithString = {
      mode: "numeric",
      value: "not a number"
    };
    const numericWithStringResult = await validate(numericWithString);
    expect(numericWithStringResult.valid).toBe(false);
    expect(numericWithStringResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'value'
      })
    );
  });

  it('should handle conditional limitTo constraints', async () => {
    const monoSchema = configureMonoSchema();
    
    const vehicleSchema = {
      $type: Object,
      $properties: {
        type: { $type: String },
        fuel: { 
          $type: String,
          $when: [
            {
              property: "type",
              condition: { equals: "car" },
              then: { limitTo: ["gasoline", "diesel", "electric", "hybrid"] as unknown[] }
            },
            {
              property: "type",
              condition: { equals: "motorcycle" },
              then: { limitTo: ["gasoline", "electric"] as unknown[] }
            }
          ] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(vehicleSchema);
    
    // Test car with valid fuel type
    const gasCar = {
      type: "car",
      fuel: "gasoline"
    };
    const gasCarResult = await validate(gasCar);
    expect(gasCarResult.valid).toBe(true);

    // Test motorcycle with valid fuel type
    const electricBike = {
      type: "motorcycle",
      fuel: "electric"
    };
    const electricBikeResult = await validate(electricBike);
    expect(electricBikeResult.valid).toBe(true);

    // Test motorcycle with invalid fuel type (diesel not allowed for motorcycles)
    const dieselBike = {
      type: "motorcycle",
      fuel: "diesel"
    };
    const dieselBikeResult = await validate(dieselBike);
    expect(dieselBikeResult.valid).toBe(false);
    expect(dieselBikeResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'fuel'
      })
    );

    // Test unknown vehicle type - should not apply limitations
    const unknownVehicle = {
      type: "boat",
      fuel: "kerosene"  // This would be invalid for car/motorcycle but valid for boats
    };
    const unknownResult = await validate(unknownVehicle);
    expect(unknownResult.valid).toBe(true);
  });

  it('should handle edge cases and error conditions', async () => {
    const monoSchema = configureMonoSchema();
    
    const edgeCaseSchema = {
      $type: Object,
      $properties: {
        trigger: { $type: String, $optional: true },
        dependent: { 
          $type: String,
          $optional: true,
          $when: [{
            property: "nonExistentProperty",  // Property that doesn't exist
            condition: { equals: "test" },
            then: { required: true }
          }] as const
        },
        nullableField: {
          $type: String,
          $optional: true
        },
        conditionalOnNull: {
          $type: String,
          $optional: true,
          $when: [{
            property: "nullableField",
            condition: { exists: true },
            then: { required: true }
          }] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(edgeCaseSchema);
    
    // Test with undefined property reference - should not throw error
    const undefinedPropertyTest = {
      trigger: "some value"
    };
    const undefinedResult = await validate(undefinedPropertyTest);
    expect(undefinedResult.valid).toBe(true);

    // Test with null value
    const nullValueTest = {
      nullableField: null
    };
    const nullResult = await validate(nullValueTest);
    expect(nullResult.valid).toBe(true); // null should not trigger exists condition

    // Test with empty string (should trigger exists condition)
    const emptyStringTest = {
      nullableField: "",
      conditionalOnNull: "required value"
    };
    const emptyStringResult = await validate(emptyStringTest);
    expect(emptyStringResult.valid).toBe(true);

    // Test with empty string but missing conditional field - should fail
    const emptyStringMissingConditional = {
      nullableField: ""
      // missing conditionalOnNull
    };
    const emptyStringMissingResult = await validate(emptyStringMissingConditional);
    expect(emptyStringMissingResult.valid).toBe(false);
    expect(emptyStringMissingResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'conditionalOnNull',
        message: 'Missing required property'
      })
    );
  });

  it('should handle conditional validation at schema level with $discriminant', async () => {
    const monoSchema = configureMonoSchema();
    
    const advancedShapeSchema = {
      $type: Object,
      $discriminant: {
        property: "shape",
        mapping: {
          "polygon": {
            $type: Object,
            $properties: {
              shape: { $type: String },
              sides: { $type: Number },
              sideLength: { 
                $type: Number,
                $optional: true,
                $when: [{
                  property: "sides",
                  condition: { range: { min: 3, max: 6 } },
                  then: { required: true }
                }] as const
              }
            }
          }
        }
      }
    } as const;

    const validate = monoSchema.validate(advancedShapeSchema);
    
    // Test triangle (3 sides) - should require sideLength
    const triangle = {
      shape: "polygon",
      sides: 3,
      sideLength: 5.0
    };
    const triangleResult = await validate(triangle);
    expect(triangleResult.valid).toBe(true);

    // Test hexagon (6 sides) - should require sideLength
    const hexagon = {
      shape: "polygon", 
      sides: 6,
      sideLength: 2.5
    };
    const hexagonResult = await validate(hexagon);
    expect(hexagonResult.valid).toBe(true);

    // Test complex polygon (>6 sides) - should not require sideLength
    const complexPolygon = {
      shape: "polygon",
      sides: 10
      // no sideLength required
    };
    const complexResult = await validate(complexPolygon);
    expect(complexResult.valid).toBe(true);

    // Test square (4 sides) without sideLength - should fail
    const incompleteSquare = {
      shape: "polygon",
      sides: 4
      // missing sideLength
    };
    const incompleteResult = await validate(incompleteSquare);
    expect(incompleteResult.valid).toBe(false);
    expect(incompleteResult.errors).toContainEqual(
      expect.objectContaining({
        path: 'sideLength',
        message: 'Missing required property'
      })
    );
  });

  it('should handle priority of multiple matching conditions', async () => {
    const monoSchema = configureMonoSchema();
    
    const prioritySchema = {
      $type: Object,
      $properties: {
        level: { $type: Number },
        action: { 
          $type: String,
          $when: [
            {
              property: "level",
              condition: { range: { min: 1, max: 10 } },
              then: { limitTo: ["basic", "standard"] as unknown[] }
            },
            {
              property: "level", 
              condition: { range: { min: 5, max: 15 } },
              then: { limitTo: ["standard", "advanced"] as unknown[] }
            },
            {
              property: "level",
              condition: { range: { min: 10, max: 20 } },
              then: { limitTo: ["advanced", "expert"] as unknown[] }
            }
          ] as const
        }
      }
    } as const;

    const validate = monoSchema.validate(prioritySchema);
    
    // Test level 3 - should match first condition only
    const level3 = {
      level: 3,
      action: "basic"
    };
    const level3Result = await validate(level3);
    expect(level3Result.valid).toBe(true);

    // Test level 7 - should match first and second conditions 
    // First matching rule should apply (basic/standard options)
    const level7 = {
      level: 7,
      action: "standard"  // Valid for both first and second condition
    };
    const level7Result = await validate(level7);
    expect(level7Result.valid).toBe(true);

    // Test level 12 - should match second and third conditions
    // First matching rule should apply (standard/advanced options)
    const level12 = {
      level: 12,
      action: "advanced"
    };
    const level12Result = await validate(level12);
    expect(level12Result.valid).toBe(true);

    // Test level 12 with expert action - should fail because first matching rule (second condition) doesn't allow expert
    const level12Expert = {
      level: 12,
      action: "expert"
    };
    const level12ExpertResult = await validate(level12Expert);
    expect(level12ExpertResult.valid).toBe(false);
  });
});
