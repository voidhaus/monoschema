import { GetContentByKeyInput, getContentByKeyInputSchema, GetContentByKeyOutput, getContentByKeyOutputSchema, Content } from "@voidhaus/cms-types";
import { input, output, procedure, resolver } from "@voidhaus/rpc";
import data from "../../providers/data";
import { query, eq } from "@voidhaus/monoschema-mongo";

const getContentByKeyResolver = resolver<
  GetContentByKeyInput,
  GetContentByKeyOutput
>(async (input) => {
  const content = await data.Client.findOne<Content>(
    "content",
    query<Content>(
      eq('key', input.key)
    )
  );

  if (!content) {
    throw new Error(`Content with key "${input.key}" not found`);
  }

  return content
});

export const getContentByKey = procedure(
  input(getContentByKeyInputSchema),
  output(getContentByKeyOutputSchema),
  getContentByKeyResolver,
);
