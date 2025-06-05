import { InferTypeFromMonoSchema, MonoSchemaInstance } from "@voidhaus/monoschema";
import { PropertyObject } from "./property";

export const BuildingBlockSchema = {
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
      $type: [PropertyObject],
      $description: "The properties of the building block.",
    },
  },
} as const;

export const BuildingBlockObject = Object.assign(
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
      const validate = monoschemaInstance.validate(BuildingBlockSchema);
      return validate(value);
    },
  }),
  { tsType: null as unknown as BuildingBlock }
)

export type BuildingBlock = InferTypeFromMonoSchema<typeof BuildingBlockSchema>;
