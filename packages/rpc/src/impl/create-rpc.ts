import type { RpcRouter, RpcConfig, Procedure, NamespaceWrapper } from './types';
import { createRpcApp } from './rpc-app';

/**
 * Creates an RPC router that can build RPC applications from procedure definitions.
 * The router handles both type validation and runtime execution of procedures.
 * 
 * @param config - Configuration object containing monoschema validator
 * @returns A router function that can create RPC applications
 */
export function createRpc(config: RpcConfig): RpcRouter {
  return function <T extends Record<string, Procedure<unknown, unknown> | NamespaceWrapper<unknown>> | NamespaceWrapper<unknown>>(
    definition: T
  ) {
    return createRpcApp(definition, config);
  } as RpcRouter;
}
