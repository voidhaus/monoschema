import { RpcApp, HttpContext, RpcContext } from "@voidhaus/rpc";
import HyperExpress from "hyper-express";

export type HyperExpressConfigOptions = {
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

    // Create HTTP context from HyperExpress request
    const httpContext: HttpContext = {
      getHeader: (name: string) => req.header(name),
      getHeaders: () => {
        const headers: Record<string, string | string[]> = {};
        // HyperExpress doesn't provide a direct way to get all headers
        // This is a limitation, but we can work with common headers
        return headers;
      },
      getQueryParameter: (name: string) => {
        const param = req.query_parameters[name];
        return Array.isArray(param) ? param[0] : param;
      },
      getQueryParameters: () => {
        const params: Record<string, string | string[]> = {};
        Object.entries(req.query_parameters).forEach(([key, value]) => {
          if (value !== undefined) {
            params[key] = value as string | string[];
          }
        });
        return params;
      },
      getMethod: () => req.method,
      getUrl: () => req.url,
      getPath: () => req.path,
      getBody: () => body,
    };

    // Create RPC context with the monoschema instance from the router config
    const rpcContext: RpcContext = {
      monoschema: router._config.monoschema,
      http: httpContext,
    };

    try {
      const result = await router.callProcedure(body, rpcContext);
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
