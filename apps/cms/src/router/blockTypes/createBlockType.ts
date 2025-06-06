import {
  CreateBlockTypeInput,
  createBlockTypeInputSchema,
  CreateBlockTypeOutput,
  createBlockTypeOutputSchema,
} from "@voidhaus/cms-types";
import { input, output, procedure, resolver } from "@voidhaus/rpc";

const createBlockTypeResolver = resolver<
  CreateBlockTypeInput,
  CreateBlockTypeOutput
>((input) => {
  // Here you would typically save the block type to a database or similar
  // For this example, we will just return the input as the created block type
  return input;
});

export const createBlockType = procedure(
  input(createBlockTypeInputSchema),
  output(createBlockTypeOutputSchema),
  createBlockTypeResolver
);
