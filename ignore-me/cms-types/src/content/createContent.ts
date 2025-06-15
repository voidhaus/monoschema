import { Any, InferTypeFromMonoSchema } from "@voidhaus/monoschema"
import { BuildingBlockKeyObject, ContentKeyObject, ContentObject } from ".."
import { Procedure } from "@voidhaus/rpc"

export const createContentInputSchema = {
  $type: Object,
  $properties: {
    key: {
      $type: ContentKeyObject,
      $description: "The key of the content to retrieve. This can be a path or identifier.",
    },
    blockKey: {
      $type: BuildingBlockKeyObject,
      $description: "The block type identifier for the content.",
    },
    properties: {
      $type: Any,
      $description: "The properties of the content.",
      $optional: true,
    },
  },
} as const

export type CreateContentInput = InferTypeFromMonoSchema<
  typeof createContentInputSchema
>

export const createContentOutputSchema = {
  $type: ContentObject,
} as const

export type CreateContentOutput = InferTypeFromMonoSchema<
  typeof createContentOutputSchema
>

export type CreateContentProcedure = Procedure<CreateContentInput, CreateContentOutput>