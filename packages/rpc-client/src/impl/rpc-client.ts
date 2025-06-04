import type { InferRpcContract } from "@voidhaus/rpc-types";

let requestId = 1;

export function resetRequestId() {
  requestId = 1;
}

// Helper type to convert contract to client
type ContractToClient<T> = {
  [K in keyof T]: T[K] extends { input: infer I; output: infer O }
    ? (params: I) => Promise<O>
    : ContractToClient<T[K]>
};

// Recursively map contract types to client types
export type RpcClient<T> = ContractToClient<InferRpcContract<T>>;

type CreateClientOptions = {
  baseUrl: string;
};

export function createClient<T>(options: CreateClientOptions): RpcClient<T> {
  function makeProxy(path: string[]): RpcClient<T> {
    return new Proxy({} as RpcClient<T>, {
      get(_target, prop: string) {
        if (typeof prop !== 'string') return undefined;
        
        // Create a function that can either be called (for procedures) or accessed (for namespaces)
        const fn = (params?: unknown) => {
          // If called with params, treat as procedure call
          if (arguments.length > 0) {
            const method = [...path, prop].join('.');
            const id = requestId++;
            return fetch(options.baseUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if ('error' in data) throw data.error;
                return data.result;
              });
          }
          
          // If accessed without calling, should not happen in normal usage
          throw new Error('Invalid access pattern');
        };
        
        // Add proxy for nested namespace access
        return new Proxy(fn, {
          get(_target, nestedProp: string) {
            if (typeof nestedProp !== 'string') return undefined;
            return makeProxy([...path, prop])[nestedProp as keyof RpcClient<T>];
          },
          apply(_target, _thisArg, args) {
            // This is when the function is called directly
            const method = [...path, prop].join('.');
            const params = args[0];
            const id = requestId++;
            return fetch(options.baseUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if ('error' in data) throw data.error;
                return data.result;
              });
          }
        });
      },
    });
  }
  
  return makeProxy([]);
}