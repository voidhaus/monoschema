import { createClient, RpcClient } from "@voidhaus/rpc-client";
import { CmsApp } from "@voidhaus/cms-types";

export const client: RpcClient<CmsApp> = createClient<CmsApp>({
  baseUrl: "http://localhost:3000/rpc",
});