import { Content } from "@voidhaus/cms-types";
import data from "../providers/data";
import { eq, query } from "@voidhaus/monoschema-mongo";
import { Constraint } from "@voidhaus/monoschema/constraints";

export const contentBlockExists = (): Constraint => {
  return {
    validate: async (contentKey: unknown) => {
      if (typeof contentKey !== 'string') {
        return false; // Ensure contentKey is a string
      }
      const content = await data.Client.findOne<Content>(
        "content",
        query<Content>(
          eq('key', contentKey as string)
        ),
        {
          limit: 1, // Limit to one result
          projection: {
            _id: 1, // Only return the _id field
          },
        },
      );
      return !!content; // Return true if content exists, false otherwise
    },
    message: (value: unknown) => {
      return `Content block with key "${value}" does not exist`;
    },
  };
}