import { createHyperExpressRpcServer } from "@voidhaus/rpc-hyper-express";
import { app } from "./router";

const hyperExpressApp = createHyperExpressRpcServer(app, {
  rpcPath: "/rpc",
})

hyperExpressApp.listen(3000, () => {
  console.log("CMS: RPC server is running on http://localhost:3000/rpc");
})