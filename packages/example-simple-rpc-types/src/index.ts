import { InferTypeFromMonoSchema } from "@voidhaus/monoschema";
import { Procedure, NamespaceWrapper, RpcApp } from "@voidhaus/rpc";

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

// SimpleApp is now a type that represents the entire RPC application
// We can use it to define the structure of our RPC app, including the procedures and namespaces.
// We also have the types for input and output schemas, which can be used to ensure type safety in our RPC calls.