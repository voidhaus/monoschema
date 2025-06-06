import {
  GetBlockTypesInput,
  getBlockTypesInputSchema,
  GetBlockTypesOutput,
  getBlockTypesOutputSchema,
} from "@voidhaus/cms-types";
import { input, output, procedure, resolver } from "@voidhaus/rpc";

const getBlockTypesResolver = resolver<GetBlockTypesInput, GetBlockTypesOutput>(
  () => {
    return [
      {
        name: "Text Block",
        key: "text-block",
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
        key: "image-block",
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
    ];
  }
);

export const getBlockTypes = procedure(
  input(getBlockTypesInputSchema),
  output(getBlockTypesOutputSchema),
  getBlockTypesResolver
);
