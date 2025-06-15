import { InferTypeFromMonoSchema, MonoSchemaInstance } from "@voidhaus/monoschema";

export type PropertyType = 'string' | 'number' | 'boolean' | 'date' | 'contentKey';

export const PropertyTypeObject = Object.assign(
  () => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') {
        return {
          valid: false,
          errors: [
            {
              message: "Property type must be a string",
              expected: "string",
              received: typeof value,
              value,
            },
          ],
        };
      }
      if (!['string', 'number', 'boolean', 'date', 'contentKey'].includes(value)) {
        return {
          valid: false,
          errors: [
            {
              message: `Invalid property type: ${value}. Expected one of 'string', 'number', 'boolean', 'date', or 'contentKey'.`,
              expected: "'string' | 'number' | 'boolean' | 'date' | 'contentKey'",
              received: value,
              value,
            },
          ],
        };
      }
      return {
        valid: true,
        data: value,
      };
    },
  }),
  { tsType: null as unknown as PropertyType }
)

export const PropertySchema = {
  $type: Object,
  $properties: {
    name: {
      $type: String,
      $description: "The name of the property.",
    },
    type: {
      $type: PropertyTypeObject,
      $description:
        "The type of the property (e.g., 'string', 'number', 'boolean').",
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

export const PropertyObject = Object.assign(
  () => ({
    validate: (value: unknown, monoschemaInstance?: MonoSchemaInstance) => {
      if (!monoschemaInstance) {
        return {
          valid: false,
          errors: [
            {
              message: "MonoSchemaInstance required",
              expected: "MonoSchemaInstance",
              received: "undefined",
              value,
            },
          ],
        };
      }
      const validate = monoschemaInstance.validate(PropertySchema);
      return validate(value);
    },
  }),
  { tsType: null as unknown as Property }
)

export type Property = InferTypeFromMonoSchema<typeof PropertySchema>;