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

    const blocksData = await Client.find<BlockTypeData>(
      "blockTypes",
      query<BlockTypeData>(),
      {
        limit,
        skip,
      }
    )

    // TODO: Find a way of stripping addition fields from the output data
    // without having to do this manually; but this should also work for
    // a generic Any type which allows us to return any data structure
    return blocksData.map((block) => ({
      key: block.key,
      name: block.name,
      description: block.description,
      properties: block.properties,
    }))
  }
);

export const getBlockTypes = procedure(
  input(getBlockTypesInputSchema),
  output(getBlockTypesOutputSchema),
  getBlockTypesResolver
);
