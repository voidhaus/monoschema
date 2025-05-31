import { describe, it, expect } from 'vitest';
import { configureMonoSchema, InferTypeFromMonoSchema } from '@voidhaus/monoschema';
import { createRpc, namespace, procedure, input, output, resolver, InferRpcContract } from './rpc';

describe('RPC Tests', () => {
  it('should process basic request', () => {
    const inputSchema = {
      $type: Object,
      $properties: {
        name: {
          $type: String,
        },
      },
    } as const;
    const outputSchema = {
      $type: Object,
      $properties: {
        greeting: {
          $type: String,
        },
      },
    } as const;

    const helloWorldProcedure = procedure(
      input(inputSchema),
      output(outputSchema),
      ({ name }) => {
        return {
          greeting: `Hello, ${name}!`,
        };
      }
    )

    const testingNamespace = namespace({
      hello: helloWorldProcedure,
    })

    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    const myApp = router(testingNamespace);
    
    // Type inference for the application type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type MyAppType = InferRpcContract<typeof myApp>;
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
      error: null,
      id: 1,
    }
    expect(myApp.callProcedure(jsonRpc)).toEqual(expectedOutput);
  })

  it('should build resolvers from typed schemas', () => {
    const inputSchema = {
      $type: Object,
      $properties: {
        name: {
          $type: String,
        },
      },
    } as const;
    const outputSchema = {
      $type: Object,
      $properties: {
        greeting: {
          $type: String,
        },
      },
    } as const;

    type InputType = InferTypeFromMonoSchema<typeof inputSchema>;
    type OutputType = InferTypeFromMonoSchema<typeof outputSchema>;

    const helloWorldResolver = resolver<InputType, OutputType>(({ name }) => {
      return {
        greeting: `Hello, ${name}!`,
      };
    })

    const helloWorldProcedure = procedure(
      input(inputSchema),
      output(outputSchema),
      helloWorldResolver
    )

    const testingNamespace = namespace({
      hello: helloWorldProcedure,
    })

    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    const myApp = router(testingNamespace);
    
    // Type inference for the application type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type MyAppType = InferRpcContract<typeof myApp>;
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
      error: null,
      id: 1,
    }
    expect(myApp.callProcedure(jsonRpc)).toEqual(expectedOutput);
  })

  it('should process nested requests', () => {
    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    const myApp = router(
      namespace({
        nested: namespace({
          hello: procedure(
            input({
              $type: Object,
              $properties: {
                name: {
                  $type: String,
                },
              },
            } as const),
            output({
              $type: Object,
              $properties: {
                greeting: {
                  $type: String,
                },
              },
            } as const),
            resolver(({ name }) => {
              return {
                greeting: `Hello, ${name}!`,
              };
            })
          )
        })
      }),
    )
    // Type inference for the application type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type MyAppType = InferRpcContract<typeof myApp>;
    const jsonRpc = {
      jsonrpc: '2.0',
      method: 'nested.hello',
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
      error: null,
      id: 1,
    }
    expect(myApp.callProcedure(jsonRpc)).toEqual(expectedOutput);
  })

  it('should handle nested namespaces with multiple levels', () => {
    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    const myApp = router(
      namespace({
        nested: namespace({
          deeper: namespace({
            hello: procedure(
              input({
                $type: Object,
                $properties: {
                  name: {
                    $type: String,
                  },
                },
              } as const),
              output({
                $type: Object,
                $properties: {
                  greeting: {
                    $type: String,
                  },
                },
              } as const),
              resolver(({ name }) => {
                return {
                  greeting: `Hello, ${name}!`,
                };
              })
            )
          })
        })
      }),
    )
    // Type inference for the application type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type MyAppType = InferRpcContract<typeof myApp>;
    const jsonRpc = {
      jsonrpc: '2.0',
      method: 'nested.deeper.hello',
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
      error: null,
      id: 1,
    }
    expect(myApp.callProcedure(jsonRpc)).toEqual(expectedOutput);
  })

  it('should handle multiple procedures in a namespace', () => {
    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    const myApp = router(
      namespace({
        hello: procedure(
          input({
            $type: Object,
            $properties: {
              name: {
                $type: String,
              },
            },
          } as const),
          output({
            $type: Object,
            $properties: {
              greeting: {
                $type: String,
              },
            },
          } as const),
          resolver(({ name }) => {
            return {
              greeting: `Hello, ${name}!`,
            };
          })
        ),
        goodbye: procedure(
          input({
            $type: Object,
            $properties: {
              name: {
                $type: String,
              },
            },
          } as const),
          output({
            $type: Object,
            $properties: {
              farewell: {
                $type: String,
              },
            },
          } as const),
          resolver(({ name }) => {
            return {
              farewell: `Goodbye, ${name}!`,
            };
          })
        )
      }),
    )
    // Type inference for the application type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type MyAppType = InferRpcContract<typeof myApp>;
    const helloJsonRpc = {
      jsonrpc: '2.0',
      method: 'hello',
      params: {
        name: 'World',
      },
      id: 1,
    }
    const goodbyeJsonRpc = {
      jsonrpc: '2.0',
      method: 'goodbye',
      params: {
        name: 'World',
      },
      id: 2,
    }
    const expectedHelloOutput = {
      jsonrpc: '2.0',
      result: {
        greeting: 'Hello, World!',
      },
      error: null,
      id: 1,
    }
    const expectedGoodbyeOutput = {
      jsonrpc: '2.0',
      result: {
        farewell: 'Goodbye, World!',
      },
      error: null,
      id: 2,
    }
    expect(myApp.callProcedure(helloJsonRpc)).toEqual(expectedHelloOutput);
    expect(myApp.callProcedure(goodbyeJsonRpc)).toEqual(expectedGoodbyeOutput);
  })

  it('should handle errors in procedures', () => {
    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    const myApp = router(
      namespace({
        errorProcedure: procedure(
          input({
            $type: Object,
            $properties: {
              name: {
                $type: String,
              },
            },
          } as const),
          output({
            $type: Object,
            $properties: {
              greeting: {
                $type: String,
              },
            },
          } as const),
          resolver(({ name }) => {
            throw new Error(`Something went wrong with ${name}`);
          })
        )
      }),
    )
    // Type inference for the application type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type MyAppType = InferRpcContract<typeof myApp>;
    const jsonRpc = {
      jsonrpc: '2.0',
      method: 'errorProcedure',
      params: {
        name: 'World',
      },
      id: 1,
    }
    const expectedErrorOutput = {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Something went wrong with World',
      },
      id: 1,
    }
    expect(myApp.callProcedure(jsonRpc)).toEqual(expectedErrorOutput);
  })

  it('should handle invalid JSON-RPC requests gracefully', () => {
    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    const myApp = router(
      namespace({
        hello: procedure(
          input({
            $type: Object,
            $properties: {
              name: {
                $type: String,
              },
            },
          } as const),
          output({
            $type: Object,
            $properties: {
              greeting: {
                $type: String,
              },
            },
          } as const),
          resolver(({ name }) => {
            return {
              greeting: `Hello, ${name}!`,
            };
          })
        )
      })
    )
    // Type inference for the application type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type MyAppType = InferRpcContract<typeof myApp>;
    const invalidJsonRpc = {
      jsonrpc: '2.0',
      method: 'hello',
      params: {
        // Missing 'name' parameter
      },
      id: 1,
    }
    const expectedErrorOutput = {
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params: Missing required parameter "name"',
      },
      id: 1,
    }
    expect(myApp.callProcedure(invalidJsonRpc)).toEqual(expectedErrorOutput);
    const invalidMethodJsonRpc = {
      jsonrpc: '2.0',
      method: 'nonExistentMethod',
      params: {
        name: 'World',
      },
      id: 1,
    }
    const expectedMethodErrorOutput = {
      jsonrpc: '2.0',
      error: {
        code: -32601,
        message: 'Method not found: nonExistentMethod',
      },
      id: 1,
    }
    expect(myApp.callProcedure(invalidMethodJsonRpc)).toEqual(expectedMethodErrorOutput);

    const invalidJsonRpcFormat = {
      jsonrpc: '2.0',
      // Missing 'method' and 'params'
      id: 1,
    }
    const expectedFormatErrorOutput = {
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Invalid Request: Missing method or params',
      },
      id: 1,
    }
    // @ts-expect-error - Intentionally passing an invalid format
    expect(myApp.callProcedure(invalidJsonRpcFormat)).toEqual(expectedFormatErrorOutput);

    const invalidJsonRpcBody = "This is not a valid JSON-RPC request";
    const expectedBodyErrorOutput = {
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error: Invalid JSON format',
      },
      id: null,
    }
    expect(myApp.callProcedure(invalidJsonRpcBody)).toEqual(expectedBodyErrorOutput);
  })
})