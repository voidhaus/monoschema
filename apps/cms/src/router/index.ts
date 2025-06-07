import { createRpc, namespace } from "@voidhaus/rpc";
import { blockTypes } from "./blockTypes";
import { configureMonoSchema } from "@voidhaus/monoschema";
import { CmsPlugin } from "@voidhaus/cms-types";
import { content } from "./content";
import { MongoTransformersPlugin, MongoTypesPlugin } from "@voidhaus/monoschema-mongo";

const rootNamespace = namespace({
  blockTypes,
  content,
})

const router = createRpc({
  monoschema: configureMonoSchema({
    plugins: [
      CmsPlugin,
      MongoTypesPlugin,
      MongoTransformersPlugin, // We may not need this if we dont use ObjectId strings
    ],
  }),
});

export const app = router(rootNamespace);