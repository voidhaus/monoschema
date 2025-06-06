import { InferTypeFromMonoSchema, MonoSchemaInstance } from "@voidhaus/monoschema";

export const PropertySchema = {
  $type: Object,
  $properties: {
    name: {
      $type: String,
      $description: "The name of the property.",
    },
    type: {
      $type: String,
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