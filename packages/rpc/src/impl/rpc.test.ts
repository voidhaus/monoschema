import { describe, it, expect } from 'vitest';
import { createRpc, procedure, namespace } from '../index';
import { configureMonoSchema } from '@voidhaus/monoschema';

describe('RPC Tests', () => {
  it('should set process basic request', () => {
    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    const myApp = router({
      hello:
        procedure()
          // input should be a monoschema schema
          .input({
            name: {
              $type: String,
            },
          } as const)
          // output should be a monoschema schema
          .output({
            greeting: {
              $type: String,
            },
          } as const)
          // input for resolve should be the inferred type from the input schema
          // output for resolve should be the inferred type from the output schema
          .resolve(({ name }) => {
            // We have full type safety here
            return {
              greeting: `Hello, ${name}!`,
            };
          })
    })

    type MyAppType = typeof myApp;

    const jsonRpc = {
      jsonrpc: '2.0',
      method: 'hello',
      params: {
        name: 'World',
      },
      id: 1,
    }
    const expectedOutput = {
      jsonrpc: '2.0',
      result: {
        greeting: 'Hello, World!',
      },
      id: 1,
    }

    expect(myApp.callProcedure(jsonRpc)).toEqual(expectedOutput);
  })

  it('should process nested requests', () => {
    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    const myApp = router({
      nested: namespace({
        namespaces: namespace({
          hello: procedure()
            .input({
              name: {
                $type: String,
              },
            } as const)
            .output({
              greeting: {
                $type: String,
              },
            } as const)
            .resolve(({ name }) => {
              return {
                greeting: `Hello, ${name}!`,
              };
            }),
        })
      }),
    })

    type MyAppType = typeof myApp;

    
    const jsonRpc = {
      jsonrpc: '2.0',
      method: 'nested.namespaces.hello',
      params: {
        name: 'World',
      },
      id: 1,
    }
    const expectedOutput = {
      jsonrpc: '2.0',
      result: {
        greeting: 'Hello, World!',
      },
      id: 1,
    }
    
    expect(myApp.callProcedure(jsonRpc)).toEqual(expectedOutput);
  })
})