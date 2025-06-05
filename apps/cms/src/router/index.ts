import { createRpc, namespace } from "@voidhaus/rpc";
import { blockTypes } from "./blockTypes";
import { configureMonoSchema } from "@voidhaus/monoschema";
import { CmsPlugin } from "@voidhaus/cms-types";

const rootNamespace = namespace({
  blockTypes,
})

const router = createRpc({
  monoschema: configureMonoSchema({
    plugins: [
      CmsPlugin,
    ],
  }),
});

export const app = router(rootNamespace);