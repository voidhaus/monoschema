import { configureMonoSchema } from "@voidhaus/monoschema";
import { InferRpcContract } from "@voidhaus/rpc-types";
import { createRpc, input, namespace, output, procedure, resolver } from "@voidhaus/rpc";
import { describe, it, beforeEach, vi, expect } from "vitest";
import { createClient, RpcClient, resetRequestId } from "./rpc-client";

// Mock fetch globally for all tests in this file
global.fetch = vi.fn();

// Utility function to mock fetch responses
const mockFetch = (response: unknown, ok = true, status = 200) => {
  return vi.mocked(fetch).mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
    headers: new Headers(),
    redirected: false,
    statusText: ok ? 'OK' : 'Error',
    type: 'basic',
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    bytes: () => Promise.resolve(new Uint8Array()),
  } as Response);
};

describe("RPC Client", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
    resetRequestId();
  });

  it('should infer procedure names and types', async () => {
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
      resolver(({ name }) => {
        return {
          greeting: `Hello, ${name}!`,
        };
      }),
    )

    const testingNamespace = namespace({
      hello: helloWorldProcedure,
      nested: namespace({
        helloGreeting: procedure(
          input(inputSchema),
          output(outputSchema),
          resolver(({ name }) => {
            return {
              greeting: `Hello Greeting, ${name}!`,
            };
          }),
        ),
      }),
    })

    const router = createRpc({
      monoschema: configureMonoSchema(),
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const myApp = router(testingNamespace);
    // Use the namespace type directly for correct inference
    type MyAppType = InferRpcContract<typeof testingNamespace>;
    const client: RpcClient<MyAppType> = createClient<MyAppType>({
      baseUrl: "http://localhost:3000/rpc",
    });

    // Mock fetch for all the calls in this test
    mockFetch({
      jsonrpc: "2.0",
      result: { greeting: "Hello, Voidhaus!" },
      id: 1
    });

    // This should be valid
    await client.hello({
      name: "Voidhaus",
    })

    // This should be invalid
    await client.hello({
      // @ts-expect-error - should not accept a number
      name: 123,
    })

    // This should be invalid
    await client.hello({
      name: "Voidhaus",
      // @ts-expect-error - should not accept an extra property
      extra: "property",
    })

    // This should be invalid
    // @ts-expect-error - should not accept a missing property
    await client.hello({
      // name: "Voidhaus", // Uncommenting this line should make it valid
    })

    // This should be invalid as helloGreeting is not a valid procedure
    // @ts-expect-error - should not accept a non-existent procedure
    await client.helloGreeting({
      name: "Voidhaus",
    })

    // This should be valid and it should handle nested namespaces
    await client.nested.helloGreeting({
      name: "Voidhaus",
    })

    // This should be invalid as nested.hello is not a valid procedure
    // @ts-expect-error - should not accept a non-existent procedure
    await client.nested.hello({
      name: "Voidhaus",
    })

    // This should be invalid
    await client.nested.helloGreeting({
      // @ts-expect-error - should not accept a non-existent procedure
      name: 123,
    })
  })

  it('should make HTTP requests using fetch', async () => {
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
      resolver(({ name }) => {
        return {
          greeting: `Hello, ${name}!`,
        };
      }),
    )

    const testingNamespace = namespace({
      hello: helloWorldProcedure,
    })

    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const myApp = router(testingNamespace);
    
    // Use the namespace type directly for correct inference
    type MyAppType = InferRpcContract<typeof testingNamespace>;
    const client: RpcClient<MyAppType> = createClient<MyAppType>({
      baseUrl: "http://localhost:3000/rpc",
    });

    // Mock the expected response
    const expectedResponse = {
      jsonrpc: "2.0",
      result: { greeting: "Hello, Voidhaus!" },
      id: 1
    };

    mockFetch(expectedResponse);

    // Make the call
    const result = await client.hello({
      name: "Voidhaus",
    });

    // Verify fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/rpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "hello",
        params: { name: "Voidhaus" },
        id: 1,
      }),
    });

    // Verify the result
    expect(result).toEqual({ greeting: "Hello, Voidhaus!" });
  })
})