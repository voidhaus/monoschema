import { InferTypeFromMonoSchema } from "@voidhaus/monoschema"
import { Procedure } from "@voidhaus/rpc"
import { BuildingBlockObject } from ".."

export const createBlockTypeInputSchema = {
  $type: BuildingBlockObject,
} as const

export type CreateBlockTypeInput = InferTypeFromMonoSchema<
  typeof createBlockTypeInputSchema
>

export const createBlockTypeOutputSchema = {
  $type: BuildingBlockObject,
} as const

export type CreateBlockTypeOutput = InferTypeFromMonoSchema<
  typeof createBlockTypeOutputSchema
>

export type CreateBlockTypeProcedure = Procedure<CreateBlockTypeInput, CreateBlockTypeOutput>;