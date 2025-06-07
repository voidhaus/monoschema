import { InferTypeFromMonoSchema, MonoSchemaInstance } from "@voidhaus/monoschema";
import { PropertyObject } from "./property"
import { BuildingBlockKeyObject } from "./buildingBlockKey";

export const BuildingBlockSchema = {
  $type: Object,
  $properties: {
    key: {
      $type: BuildingBlockKeyObject,
      $description: "A unique identifier for the building block.",
    },
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
