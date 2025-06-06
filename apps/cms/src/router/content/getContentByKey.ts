import { GetContentByKeyInput, getContentByKeyInputSchema, GetContentByKeyOutput, getContentByKeyOutputSchema } from "@voidhaus/cms-types";
import { input, output, procedure, resolver } from "@voidhaus/rpc";

const getContentByKeyResolver = resolver<
  GetContentByKeyInput,
  GetContentByKeyOutput
>((input) => {
  // Here you would typically save the block type to a database or similar
  // For this example, we will just return the input as the created block type
  return {
    __BLOCK_TYPE__: "hyperlink",
    key: input.key,
    properties: {
      href: "https://example.com",
      text: "Example Link",
    },
  }
})

export const getContentByKey = procedure(
  input(getContentByKeyInputSchema),
  output(getContentByKeyOutputSchema),
  getContentByKeyResolver,
)
