import { BuildingBlockKeyObject, PropertyObject } from "@voidhaus/cms-types";
import { InferTypeFromMonoSchema } from "@voidhaus/monoschema";
import { ObjectID } from "@voidhaus/monoschema-mongo";

export const BlockTypeDataSchema = {
  $type: Object,
  $properties: {
    _id: { $type: ObjectID, $optional: true },
    key: { $type: BuildingBlockKeyObject },
    name: { $type: String },
    description: { $type: String, $optional: true },
    properties: {
      $type: [PropertyObject],
      $description: "The properties of the block type.",
    },
  },
} as const;

export type BlockTypeData = InferTypeFromMonoSchema<typeof BlockTypeDataSchema>
