import {
  GetBlockTypesInput,
  getBlockTypesInputSchema,
  GetBlockTypesOutput,
  getBlockTypesOutputSchema,
} from "@voidhaus/cms-types";
import { input, output, procedure, resolver } from "@voidhaus/rpc";
import { data } from "../../providers";
import { query } from "@voidhaus/monoschema-mongo";
import { BlockTypeData } from "../../providers/data/types";

const getBlockTypesResolver = resolver<GetBlockTypesInput, GetBlockTypesOutput>(
  ({ page, pageSize }) => {
    const limit = pageSize || 10; // Default to 10 if pageSize is not provided
    const skip = ((page || 1) - 1) * limit; // Calculate the number of documents to skip

    data.query(
      "blockTypes",
      query<BlockTypeData>(),
      {
        limit,
        skip,
      }
    )

    return []
  }
);

export const getBlockTypes = procedure(
  input(getBlockTypesInputSchema),
  output(getBlockTypesOutputSchema),
  getBlockTypesResolver
);
