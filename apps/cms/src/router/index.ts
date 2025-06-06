import { createRpc, namespace } from "@voidhaus/rpc";
import { blockTypes } from "./blockTypes";
import { configureMonoSchema } from "@voidhaus/monoschema";
import { CmsPlugin } from "@voidhaus/cms-types";
import { content } from "./content";

const rootNamespace = namespace({
  blockTypes,
  content,
})

const router = createRpc({
  monoschema: configureMonoSchema({
    plugins: [
      CmsPlugin,
    ],
  }),
});

export const app = router(rootNamespace);