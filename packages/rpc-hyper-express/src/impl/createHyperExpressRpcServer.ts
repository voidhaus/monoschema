import { RpcApp } from "@voidhaus/rpc";
import HyperExpress from "hyper-express";

export type HyperExpressConfigOptions = {
  port: number;
  rpcPath?: string;
};

export type HyperExpressRpcServer = {
  server: HyperExpress.Server;
  listen: (port: number, callback?: () => void) => void;
  close: (callback?: () => void) => void;
};

export const createHyperExpressRpcServer = <T>(
  router: RpcApp<T>,
  opts: HyperExpressConfigOptions
) => {
  const server = new HyperExpress.Server();

  const rpcPath = opts.rpcPath || "/rpc";
  server.post(rpcPath, async (req, res) => {
    let body;
    try {
      body = await req.json();
    } catch {
      // JSON parse error
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error",
        },
        id: null,
      });
    }

    // Validate JSON-RPC format
    if (
      typeof body !== "object" ||
      body === null ||
      body.jsonrpc !== "2.0" ||
      typeof body.method !== "string" ||
      (!("params" in body) && body.params !== undefined) ||
      !("id" in body) ||
      (typeof body.id !== "string" &&
        typeof body.id !== "number" &&
        body.id !== null)
    ) {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Invalid Request",
        },
        id: body && "id" in body ? body.id : null,
      });
    }

    try {
      const result = await router.callProcedure(body);
      return res.status(200).json(result);
    } catch {
      // Internal server error in JSON-RPC format
      return res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal error",
        },
        id: body && body.id !== undefined ? body.id : null,
      });
    }
  });

  const rpcServer: HyperExpressRpcServer = {
    server,
    listen: (port: number, callback?: () => void) => {
      server.listen(port, callback);
    },
    close: (callback?: () => void) => {
      server.close(callback);
    },
  };

  return rpcServer;
};
