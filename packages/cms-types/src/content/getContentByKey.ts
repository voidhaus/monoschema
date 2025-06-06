import { InferTypeFromMonoSchema } from "@voidhaus/monoschema"
import { ContentKeyObject, ContentObject } from ".."
import { Procedure } from "@voidhaus/rpc"

export const getContentByKeyInputSchema = {
  $type: Object,
  $properties: {
    key: {
      $type: ContentKeyObject,
      $description: "The key of the content to retrieve. This can be a path or identifier.",
    },
    resolveChildren: {
      $type: Boolean,
      $optional: true,
      $description:
        "Whether to resolve child content. If true, the content will include any nested content associated with the key.",
    }
  },
} as const

export type GetContentByKeyInput = InferTypeFromMonoSchema<
  typeof getContentByKeyInputSchema
>

export const getContentByKeyOutputSchema = {
  $type: ContentObject,
} as const

export type GetContentByKeyOutput = InferTypeFromMonoSchema<
  typeof getContentByKeyOutputSchema
>

export type GetContentByKeyProcedure = Procedure<GetContentByKeyInput, GetContentByKeyOutput>