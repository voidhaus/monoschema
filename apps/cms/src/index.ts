import { createRpc, input, namespace, output, procedure, resolver } from "@voidhaus/rpc";
import { BuildingBlockObject, CmsPlugin } from "./types";
import { configureMonoSchema } from "@voidhaus/monoschema";
import { createHyperExpressRpcServer } from "@voidhaus/rpc-hyper-express";

const rootNamespace = namespace({
  blockTypes: namespace({
    getBlockTypes: procedure(
      input({
        $type: Object,
      } as const),
      output({
        $type: [BuildingBlockObject]
      } as const),
      resolver(() => {
        return [
          {
            name: "Text Block",
            description: "A simple text block",
            properties: [
              {
                name: "text",
                type: "string",
                description: "The text content of the block",
              },
            ],
          },
          {
            name: "Image Block",
            description: "A block for displaying images",
            properties: [
              {
                name: "imageUrl",
                type: "string",
                description: "The URL of the image to display",
              },
              {
                name: "altText",
                type: "string",
                description: "Alternative text for the image",
              },
            ],
          },
        ];
      }),
    ),
  }),
})

const router = createRpc({
  monoschema: configureMonoSchema({
    plugins: [
      CmsPlugin,
    ],
  }),
});

const appInferred = router(rootNamespace);

const hyperExpressApp = createHyperExpressRpcServer(appInferred, {
  rpcPath: "/rpc",
})

hyperExpressApp.listen(3000, () => {
  console.log("CMS: RPC server is running on http://localhost:3000/rpc");
})