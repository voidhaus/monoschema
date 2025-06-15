import { InferTypeFromMonoSchema } from "@voidhaus/monoschema";
import { Procedure } from "@voidhaus/rpc";
import { BuildingBlockObject } from "..";
import { max, min } from "@voidhaus/monoschema/constraints";

export const getBlockTypesInputSchema = {
  $type: Object,
  $properties: {
    page: {
      $type: Number,
      $optional: true,
      $constraints: [
        min(1),
      ],
    },
    pageSize: {
      $type: Number,
      $optional: true,
      $constraints: [
        min(1),
        max(25),
      ],
    },
  },
} as const;

export type GetBlockTypesInput = InferTypeFromMonoSchema<
  typeof getBlockTypesInputSchema
>;

export const getBlockTypesOutputSchema = {
  $type: [BuildingBlockObject],
} as const;

export type GetBlockTypesOutput = InferTypeFromMonoSchema<
  typeof getBlockTypesOutputSchema
>;

export type GetBlockTypesProcedure = Procedure<GetBlockTypesInput, GetBlockTypesOutput>;
