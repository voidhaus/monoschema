import { InferTypeFromMonoSchema } from "@voidhaus/monoschema";
import { Procedure, NamespaceWrapper, RpcApp } from "@voidhaus/rpc";
import { describe, it, vi } from "vitest";
import { createClient, RpcClient } from "./rpc-client";

export const GreetingInputSchema = {
  $type: Object,
  $properties: {
    name: {
      $type: String,
    },
  },
} as const;

export const GreetingOutputSchema = {
  $type: Object,
  $properties: {
    greeting: {
      $type: String,
    },
  },
} as const;

export type GreetingInput = InferTypeFromMonoSchema<typeof GreetingInputSchema>;
export type GreetingOutput = InferTypeFromMonoSchema<typeof GreetingOutputSchema>;
export type GreetingProcedure = Procedure<GreetingInput, GreetingOutput>;

export const GetDateInputSchema = {
  $type: Object,
} as const;
export const GetDateOutputSchema = {
  $type: Object,
  $properties: {
    date: {
      $type: Date,
    },
  },
} as const;

export type GetDateInput = InferTypeFromMonoSchema<typeof GetDateInputSchema>;
export type GetDateOutput = InferTypeFromMonoSchema<typeof GetDateOutputSchema>;
export type GetDateProcedure = Procedure<GetDateInput, GetDateOutput>;

export type NestedNamespace = NamespaceWrapper<{
  getDate: GetDateProcedure;
}>;

export type RootNamespace = NamespaceWrapper<{
  greeting: GreetingProcedure;
  nested: NestedNamespace;
}>;

export type SimpleApp = RpcApp<RootNamespace>;

// Mock fetch globally for all tests in this file
global.fetch = vi.fn();

describe("RPC Client", () => {  
  it('should infer procedure names and types when using types', async () => {
    // Mock fetch to return successful responses
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        jsonrpc: '2.0',
        result: { greeting: 'Hello, World!' },
        id: 1
      }),
      text: () => Promise.resolve(JSON.stringify({
        jsonrpc: '2.0',
        result: { greeting: 'Hello, World!' },
        id: 1
      })),
      headers: new Headers(),
      redirected: false,
      statusText: 'OK',
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

    const client: RpcClient<SimpleApp> = createClient<SimpleApp>({
      baseUrl: "http://localhost:3000/rpc",
    });

    // This should be valid
    await client.greeting({
      name: "World",
    })

    // This should also be valid
    await client.nested.getDate({});

    // This should be invalid - no such procedure
    // @ts-expect-error myGreeting procedure does not exist
    await client.myGreeting({
      name: "World",
    })
  })
})