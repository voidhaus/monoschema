import { input, output, procedure, resolver } from "@voidhaus/rpc";
import { InferTypeFromMonoSchema } from "@voidhaus/monoschema";
import { BuildingBlockObject } from "@voidhaus/cms-types";

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

const getBlockTypesResolver = resolver<GetBlockTypesInput, GetBlockTypesOutput>(
  () => {
    return [
      {
        name: "Text Block",
        description: "A simple text block",
        properties: [
          {
            name: "text",
            type: "string",
            description: "The text content of the block",
          },
        ],
      },
      {
        name: "Image Block",
        description: "A block for displaying images",
        properties: [
          {
            name: "imageUrl",
            type: "string",
            description: "The URL of the image to display",
          },
          {
            name: "altText",
            type: "string",
            description: "Alternative text for the image",
          },
        ],
      },
    ]
  }
);

export const getBlockTypes = procedure(
  input(getBlockTypesInputSchema),
  output(getBlockTypesOutputSchema),
  getBlockTypesResolver,
);
