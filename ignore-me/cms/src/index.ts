import { createHyperExpressRpcServer } from "@voidhaus/rpc-hyper-express";
import { app } from "./router";
import { initializeMongoClient } from "./providers/data";

const main = async () => {
  // TODO: Env variable for MongoDB URI
  await initializeMongoClient("mongodb://localhost:27017/cms")
  
  const hyperExpressApp = createHyperExpressRpcServer(app, {
    rpcPath: "/rpc",
  })

  hyperExpressApp.listen(3000, () => {
    console.log("CMS: RPC server is running on http://localhost:3000/rpc");
  })
}

main()