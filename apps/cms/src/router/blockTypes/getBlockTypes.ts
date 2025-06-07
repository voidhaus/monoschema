import {
  GetBlockTypesInput,
  getBlockTypesInputSchema,
  GetBlockTypesOutput,
  getBlockTypesOutputSchema,
} from "@voidhaus/cms-types";
import { input, output, procedure, resolver } from "@voidhaus/rpc";
import { Client } from "../../providers/data";
import { query } from "@voidhaus/monoschema-mongo";
import { BlockTypeData } from "../../providers/data/types";

const getBlockTypesResolver = resolver<GetBlockTypesInput, GetBlockTypesOutput>(
  async ({ page, pageSize }) => {
    const limit = pageSize || 10; // Default to 10 if pageSize is not provided
    const skip = ((page || 1) - 1) * limit; // Calculate the number of documents to skip

    return await Client.find<BlockTypeData>(
      "blockTypes",
      query<BlockTypeData>(),
      {
        limit,
        skip,
      }
    )
  }
);

export const getBlockTypes = procedure(
  input(getBlockTypesInputSchema),
  output(getBlockTypesOutputSchema),
  getBlockTypesResolver
);
