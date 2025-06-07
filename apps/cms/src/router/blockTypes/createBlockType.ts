import {
  CreateBlockTypeInput,
  createBlockTypeInputSchema,
  CreateBlockTypeOutput,
  createBlockTypeOutputSchema,
} from "@voidhaus/cms-types";
import data from "../../providers/data";
import { input, output, procedure, resolver } from "@voidhaus/rpc";
import { BlockTypeData } from "../../providers/data/types";

const createBlockTypeResolver = resolver<
  CreateBlockTypeInput,
  CreateBlockTypeOutput
>(async (input) => {
  const result = await data.Client.insertOne<BlockTypeData>(
    "blockTypes",
    input,
  );
  return {
    ...input,
    _id: result.insertedId, // Set the _id field to the inserted ID
  }
});

export const createBlockType = procedure(
  input(createBlockTypeInputSchema),
  output(createBlockTypeOutputSchema),
  createBlockTypeResolver
);
