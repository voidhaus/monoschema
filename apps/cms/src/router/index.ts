import { createRpc, namespace } from "@voidhaus/rpc";
import { blockTypes } from "./blockTypes";
import { configureMonoSchema } from "@voidhaus/monoschema";
import { configureCmsPlugin, Content } from "@voidhaus/cms-types";
import { content } from "./content";
import { eq, MongoTransformersPlugin, MongoTypesPlugin, query } from "@voidhaus/monoschema-mongo";
import data from "../providers/data";

const rootNamespace = namespace({
  blockTypes,
  content,
})

const isDevelopment = process.env.npm_lifecycle_event === 'dev'
const router = createRpc({
  monoschema: configureMonoSchema({
    plugins: [
      // CMS Plugin provides the CMS types and validation schemas
      configureCmsPlugin({
        // Optionally, you can provide a function to check if a content block exists
        // This is useful for validating content keys against existing blocks
        checkContentBlockExists: async (contentKey) => {
          const content = await data.Client.findOne<Content>(
            "content",
            query<Content>(
              eq('key', contentKey)
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
      }),
      // MongoDB plugins provide MongoDB specific types (ObjectId, etc.)
      MongoTypesPlugin,
      // MongoDB transformers plugin provides transformers for MongoDB types
      // This is useful for transforming and validating string to ObjectId
      MongoTransformersPlugin,
    ],
    // We are using this to ensure that extra properties are stripped from the output
    // This is useful for ensuring that the output matches the schema exactly
    // and prevents unexpected properties from being returned.
    stripUnknownProperties: true,
  }),
  // Enable output validation to ensure that the output matches the schema
  validateOutput: true,
  // Eanble output masking to ensure that if we have errors we don't leak internal details
  // This is useful for preventing sensitive information from being exposed
  // in production environments.
  // In development, you might want to disable this to see the actual validation errors.
  maskOutputValidationErrors: !isDevelopment,
});

export const app = router(rootNamespace);