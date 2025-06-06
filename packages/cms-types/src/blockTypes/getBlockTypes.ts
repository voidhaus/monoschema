import { InferTypeFromMonoSchema } from "@voidhaus/monoschema";
import { Procedure } from "@voidhaus/rpc";
import { BuildingBlockObject } from "..";

export const getBlockTypesInputSchema = {
  $type: Object,
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
